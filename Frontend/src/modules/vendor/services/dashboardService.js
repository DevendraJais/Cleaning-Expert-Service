import api from '../../../services/api';

/**
 * Vendor Dashboard Service
 * Handles all dashboard-related API calls
 */
export const vendorDashboardService = {
  /**
   * Get vendor dashboard statistics
   * @returns {Promise<Object>} Dashboard stats and recent bookings
   */
  getDashboardStats: async () => {
    try {
      const response = await api.get('/vendors/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  /**
   * Get revenue analytics
   * @param {string} period - 'daily', 'weekly', or 'monthly'
   * @returns {Promise<Object>} Revenue analytics data
   */
  getRevenueAnalytics: async (period = 'monthly') => {
    try {
      const response = await api.get(`/vendors/dashboard/revenue?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      throw error;
    }
  },

  /**
   * Get worker performance statistics
   * @returns {Promise<Object>} Worker performance data
   */
  getWorkerPerformance: async () => {
    try {
      const response = await api.get('/vendors/dashboard/workers');
      return response.data;
    } catch (error) {
      console.error('Error fetching worker performance:', error);
      throw error;
    }
  },

  /**
   * Get service performance metrics
   * @returns {Promise<Object>} Service performance data
   */
  getServicePerformance: async () => {
    try {
      const response = await api.get('/vendors/dashboard/services');
      return response.data;
    } catch (error) {
      console.error('Error fetching service performance:', error);
      throw error;
    }
  }
};
