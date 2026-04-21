import api from './api';

/**
 * Vendor Wallet/Ledger Service
 * Handles cash collection, settlements, and transaction history
 */
const vendorWalletService = {
  /**
   * Get wallet balance and summary
   */
  getWallet: async () => {
    const response = await api.get('/vendors/wallet');
    return response.data;
  },

  /**
   * Get wallet summary for dashboard
   */
  getWalletSummary: async () => {
    const response = await api.get('/vendors/wallet/summary');
    return response.data;
  },

  /**
   * Get transaction history/ledger
   */
  getTransactions: async (params = {}) => {
    const response = await api.get('/vendors/wallet/transactions', { params });
    return response.data;
  },

  /**
   * Initiate cash collection (OTP)
   */
  initiateCashCollection: async (bookingId, totalAmount, extraItems = []) => {
    const response = await api.post(`/bookings/cash/${bookingId}/initiate`, {
      totalAmount,
      extraItems
    });
    return response.data;
  },

  /**
   * Initiate online collection (QR)
   */
  initiateOnlineCollection: async (bookingId, totalAmount, extraItems = []) => {
    const response = await api.post(`/bookings/cash/${bookingId}/initiate-online`, {
      totalAmount,
      extraItems
    });
    return response.data;
  },

  /**
   * Verify online collection (QR) and finalize
   */
  verifyOnlineCollection: async (bookingId) => {
    const response = await api.post(`/bookings/cash/${bookingId}/verify-online`);
    return response.data;
  },

  /**
   * Manually confirm online collection (For fallback Manual QR)
   */
  confirmManualOnlineCollection: async (bookingId, otp) => {
    const response = await api.post(`/bookings/cash/${bookingId}/confirm-manual-online`, { otp });
    return response.data;
  },

  /**
   * Confirm cash collection
   */
  confirmCashCollection: async (bookingId, amount, otp = '', extraItems = []) => {
    const response = await api.post(`/bookings/cash/${bookingId}/confirm`, {
      amount,
      otp,
      extraItems
    });
    return response.data;
  },

  /**
   * Record cash collection (Legacy - redirects to confirm)
   */
  recordCashCollection: async (bookingId, amount, notes = '') => {
    return vendorWalletService.confirmCashCollection(bookingId, amount);
  },

  /**
   * Request settlement (vendor pays admin)
   */
  requestSettlement: async (data) => {
    const response = await api.post('/vendors/wallet/settlement', data);
    return response.data;
  },

  /**
   * Get settlement history
   */
  getSettlements: async (params = {}) => {
    const response = await api.get('/vendors/wallet/settlements', { params });
    return response.data;
  },

  /**
   * Pay worker for a booking
   */
  payWorker: async (bookingId, amount, notes = '', transactionId = '', screenshot = '', paymentMethod = 'cash') => {
    const response = await api.post('/vendors/wallet/pay-worker', {
      bookingId,
      amount,
      notes,
      transactionId,
      screenshot,
      paymentMethod
    });
    return response.data;
  },

  /**
   * Request Withdrawal
   */
  requestWithdrawal: async (data) => {
    const response = await api.post('/vendors/wallet/withdrawal', data);
    return response.data;
  }
};

export default vendorWalletService;
