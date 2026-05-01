const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/authMiddleware');
const { isWorker } = require('../../middleware/roleMiddleware');
const {
  getWallet,
  getTransactions,
  requestPayout,
  requestWithdrawal
} = require('../../controllers/workerControllers/workerWalletController');

// Get wallet balance
router.get('/', authenticate, isWorker, getWallet);

// Get transaction history
router.get('/transactions', authenticate, isWorker, getTransactions);

// Request payout from vendor (Legacy - for vendor bookings)
router.post('/request-payout', authenticate, isWorker, requestPayout);

// Request withdrawal from admin (Direct Worker Model)
router.post('/withdraw', authenticate, isWorker, requestWithdrawal);

module.exports = router;
