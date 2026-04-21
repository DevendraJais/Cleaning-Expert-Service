import api from './api';

/**
 * Wallet Service
 * Handles all API calls for User Wallet
 */

export const walletService = {
  // Get wallet balance
  getBalance: async () => {
    const response = await api.get('/user/wallet/balance');
    return response.data;
  },

  // Add money to wallet (create Razorpay order)
  addMoney: async (amount) => {
    const response = await api.post('/user/wallet/add-money', { amount });
    return response.data;
  },

  // Verify wallet top-up payment
  verifyTopup: async (paymentData) => {
    const response = await api.post('/user/wallet/verify-topup', paymentData);
    return response.data;
  },

  // Get wallet transaction history
  getTransactions: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const response = await api.get(`/user/wallet/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
    return response.data;
  }
};

export default walletService;

