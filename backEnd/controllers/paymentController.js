const Course = require('../models/Course');
const Payment = require('../models/Payment');
const {
  createPaymentIntent,
  retrievePaymentIntent,
  createRefund,
  handleWebhook
} = require('../config/stripe');


exports.createPaymentIntent = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.status !== 'published') return res.status(400).json({ message: 'Course not available' });
    if (course.price === 0) return res.status(400).json({ message: 'Course is free' });
    if (course.isEnrolled(req.user.id)) return res.status(400).json({ message: 'Already enrolled' });

    const paymentIntent = await createPaymentIntent(
      course.price,
      'USD',
      {
        courseId: courseId.toString(),
        userId: req.user.id.toString(),
        payment_mode: process.env.STRIPE_MODE || 'sandbox' 
      }
    );

    const commissionRate = 0.20;
    const platformCommission = Math.round(course.price * commissionRate * 100) / 100;
    const instructorAmount = Math.round((course.price - platformCommission) * 100) / 100;

    await Payment.create({
      user: req.user.id,
      course: courseId,
      amount: course.price,
      platformCommission,
      instructorAmount,
      currency: 'USD',
      paymentIntentId: paymentIntent.id,
      status: 'pending',
      mode: process.env.STRIPE_MODE || 'sandbox',
      metadata: { courseTitle: course.title, userId: req.user.id.toString() }
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      isSandbox: process.env.STRIPE_MODE === 'sandbox'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.requestRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;
    const payment = await Payment.findById(paymentId);

    if (!payment || payment.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not eligible for refund' });
    }

    const refund = await createRefund(payment.paymentIntentId);
    payment.status = 'refunded';
    await payment.save();

    res.status(200).json({ success: true, message: 'Refund processed' });
  } catch (error) {
    res.status(500).json({ message: 'Refund failed', error: error.message });
  }
};


exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    const payment = await Payment.findOne({ paymentIntentId });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const stripePaymentIntent = await retrievePaymentIntent(paymentIntentId);
    payment.status = stripePaymentIntent.status;
    await payment.save();

    res.status(200).json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.getMyPayments = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const payments = await Payment.find({ user: req.user.id })
      .populate('course', 'title thumbnail')
      .sort({ createdAt: -1 }).skip(skip).limit(limit);

    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.handleWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const event = await handleWebhook(req.body, sig);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id });
      if (payment) {
        payment.status = 'succeeded';
        await payment.save();
        const course = await Course.findById(payment.course);
        if (course) await course.enrollStudent(payment.user);
      }
    }
    res.status(200).json({ received: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const getPaginationParams = (query) => {
  let page = parseInt(query.page) || 1;
  let limit = parseInt(query.limit) || 10;
  return { page, limit, skip: (page - 1) * limit };
};
