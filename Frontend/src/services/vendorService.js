import api from './api';

const vendorService = {
  // Get vendor profile
  getProfile: async () => {
    const response = await api.get('/vendors/profile');
    return response.data;
  },

  // Update vendor profile
  updateProfile: async (profileData) => {
    const response = await api.put('/vendors/profile', profileData);
    return response.data;
  },

  // Update vendor address
  updateAddress: async (addressData) => {
    const response = await api.put('/vendors/address', addressData);
    return response.data;
  },

  // Update real-time location
  updateLocation: async (lat, lng) => {
    return api.put('/vendors/profile/location', { lat, lng });
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/vendors/dashboard/stats');
    return response.data;
  },

  // Get revenue analytics
  getRevenueAnalytics: async (period) => {
    const response = await api.get(`/vendors/dashboard/revenue?period=${period}`);
    return response.data;
  }
};

export default vendorService;
