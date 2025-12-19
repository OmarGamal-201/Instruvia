
const stripe = require('stripe')(
  process.env.STRIPE_MODE === 'sandbox' 
    ? process.env.STRIPE_TEST_SECRET_KEY 
    : process.env.STRIPE_SECRET_KEY
);

const createPaymentIntent = async (amount, currency = 'USD', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: {
        ...metadata,
        mode: process.env.STRIPE_MODE || 'sandbox', 
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error('Stripe payment intent creation error:', error);
    throw new Error('Failed to create payment intent');
  }
};
const confirmPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Stripe payment confirmation error:', error);
    throw new Error('Failed to confirm payment');
  }
};
const retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Stripe payment retrieval error:', error);
    throw new Error('Failed to retrieve payment');
  }
};
const createRefund = async (paymentIntentId, amount) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });

    return refund;
  } catch (error) {
    console.error('Stripe refund creation error:', error);
    throw new Error('Failed to create refund');
  }
};
const createCustomer = async (email, name) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
    });

    return customer;
  } catch (error) {
    console.error('Stripe customer creation error:', error);
    throw new Error('Failed to create customer');
  }
};
const handleWebhook = async (payload, sig) => {
  let event;
  
  const webhookSecret = process.env.STRIPE_MODE === 'sandbox'
    ? process.env.STRIPE_TEST_WEBHOOK_SECRET
    : process.env.STRIPE_WEBHOOK_SECRET;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    throw new Error('Webhook signature verification failed');
  }


  switch (event.type) {
    case 'payment_intent.succeeded':
      console.log('Sandbox/Live Payment succeeded:', event.data.object.id);
      break;

    case 'payment_intent.payment_failed':
      console.log(' Payment failed:', event.data.object.id);
      break;

    default:
      console.log(` Unhandled event type: ${event.type}`);
  }

  return event;
};

module.exports = {
  createPaymentIntent,
  confirmPaymentIntent,
  retrievePaymentIntent,
  createRefund,
  createCustomer,
  handleWebhook
};
