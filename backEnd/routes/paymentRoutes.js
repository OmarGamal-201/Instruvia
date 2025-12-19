const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  getPaymentStatus,
  getMyPayments,
  requestRefund,
  handleWebhook
} = require('../controllers/paymentController');
const protect = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');

// Protected routes
router.post('/create-intent', protect, createPaymentIntent);
router.get('/my-payments', protect, getMyPayments);
router.get('/:paymentIntentId', protect, getPaymentStatus);

// Admin routes
router.post('/:paymentId/refund', protect, authorize('admin'), requestRefund);

// Webhook route (no authentication needed)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
