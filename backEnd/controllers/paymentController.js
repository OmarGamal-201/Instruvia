const Course = require('../models/Course');
const Payment = require('../models/Payment');
const {
  createPaymentIntent,
  retrievePaymentIntent,
  createRefund,
  handleWebhook
} = require('../config/stripe');

// POST /api/payments/create-intent - Create payment intent for course enrollment
exports.createPaymentIntent = async (req, res) => {
  try {
    const { courseId } = req.body;

    // Validate course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if course is published
    if (course.status !== 'published') {
      return res.status(400).json({ message: 'Course is not available for purchase' });
    }

    // Check if course is free
    if (course.price === 0) {
      return res.status(400).json({ message: 'This course is free. No payment required.' });
    }

    // Check if user is already enrolled
    if (course.isEnrolled(req.user.id)) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    // Check if user is the instructor
    if (course.instructor.toString() === req.user.id) {
      return res.status(400).json({ message: 'Instructors cannot purchase their own courses' });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({
      user: req.user.id,
      course: courseId,
      status: 'succeeded'
    });

    if (existingPayment) {
      return res.status(400).json({ message: 'You have already paid for this course' });
    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent(
      course.price,
      'USD',
      {
        courseId: courseId.toString(),
        userId: req.user.id.toString(),
        courseTitle: course.title
      }
    );

    // Calculate commission (20% platform, 80% instructor)
    const commissionRate = 0.20;
    const platformCommission = Math.round(course.price * commissionRate * 100) / 100;
    const instructorAmount = Math.round((course.price - platformCommission) * 100) / 100;

    // Save payment record with commission details
    await Payment.create({
      user: req.user.id,
      course: courseId,
      amount: course.price,
      platformCommission,
      instructorAmount,
      platformCommissionRate: commissionRate,
      currency: 'USD',
      paymentIntentId: paymentIntent.id,
      status: 'pending',
      metadata: {
        courseTitle: course.title,
        userId: req.user.id.toString()
      }
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: course.price,
      currency: 'USD',
      course: {
        id: course._id,
        title: course.title,
        instructor: course.instructor
      }
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/payments/:paymentIntentId - Get payment status
exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    // Get payment from database
    const payment = await Payment.findOne({ paymentIntentId })
      .populate('user', 'name email')
      .populate('course', 'title description instructor');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if user owns this payment
    if (payment.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get latest status from Stripe
    const stripePaymentIntent = await retrievePaymentIntent(paymentIntentId);

    // Update payment status if different
    if (payment.status !== stripePaymentIntent.status) {
      payment.status = stripePaymentIntent.status;
      
      if (stripePaymentIntent.status === 'succeeded') {
        // Enroll user in course
        const course = await Course.findById(payment.course);
        if (course && !course.isEnrolled(req.user.id)) {
          await course.enrollStudent(req.user.id);
        }
      } else if (stripePaymentIntent.last_payment_error) {
        payment.failureReason = stripePaymentIntent.last_payment_error.message;
      }

      await payment.save();
    }

    res.status(200).json({
      success: true,
      payment: {
        id: payment._id,
        amount: payment.amount,
        platformCommission: payment.platformCommission,
        instructorAmount: payment.instructorAmount,
        platformCommissionRate: payment.platformCommissionRate,
        currency: payment.currency,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        failureReason: payment.failureReason,
        course: payment.course
      }
    });
  } catch (error) {
    console.error('Payment status retrieval error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/payments/my-payments - Get user's payment history
exports.getMyPayments = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);

    const filter = { user: req.user.id };
    if (req.query.status) filter.status = req.query.status;

    const payments = await Payment.find(filter)
      .populate('course', 'title thumbnail instructor')
      .populate('course.instructor', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments(filter);

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    };

    res.status(200).json({
      success: true,
      payments,
      pagination
    });
  } catch (error) {
    console.error('Payment history retrieval error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/payments/:paymentId/refund - Request refund (admin only)
exports.requestRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    const payment = await Payment.findById(paymentId)
      .populate('user', 'name email')
      .populate('course', 'title');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if payment is eligible for refund
    if (payment.status !== 'succeeded') {
      return res.status(400).json({ message: 'Only successful payments can be refunded' });
    }

    if (payment.refundedAmount > 0) {
      return res.status(400).json({ message: 'Payment has already been partially refunded' });
    }

    // Create refund in Stripe
    const refund = await createRefund(payment.paymentIntentId);

    // Update payment record
    payment.status = 'refunded';
    payment.refundedAmount = payment.amount;
    payment.metadata.refundReason = reason || 'Customer request';
    payment.metadata.refundId = refund.id;

    await payment.save();

    // Remove user from course enrollment
    const course = await Course.findById(payment.course);
    if (course) {
      course.enrolledStudents = course.enrolledStudents.filter(
        enrollment => enrollment.student.toString() !== payment.user._id.toString()
      );
      await course.save();
    }

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      refund: {
        id: refund.id,
        amount: refund.amount / 100, // Convert from cents
        currency: refund.currency,
        status: refund.status
      }
    });
  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/payments/webhook - Handle Stripe webhooks
exports.handleWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const payload = req.body;

    const event = await handleWebhook(payload, sig);

    // Handle specific events
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      
      // Update payment in database
      const payment = await Payment.findOne({ 
        paymentIntentId: paymentIntent.id 
      });

      if (payment) {
        payment.status = 'succeeded';
        await payment.save();

        // Enroll user in course
        const course = await Course.findById(payment.course);
        if (course && !course.isEnrolled(payment.user)) {
          await course.enrollStudent(payment.user);
        }
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      
      // Update payment in database
      const payment = await Payment.findOne({ 
        paymentIntentId: paymentIntent.id 
      });

      if (payment) {
        payment.status = 'failed';
        if (paymentIntent.last_payment_error) {
          payment.failureReason = paymentIntent.last_payment_error.message;
        }
        await payment.save();
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Helper function for pagination (imported from utils)
const getPaginationParams = (query) => {
  let page = parseInt(query.page) || 1;
  let limit = parseInt(query.limit) || 10;
  
  if (page < 1) page = 1;
  if (limit < 1) limit = 10;
  if (limit > 100) limit = 100;
  
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};
