import api from './api';

const workerService = {
  // Profile
  getProfile: async () => {
    const response = await api.get('/workers/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/workers/profile', profileData);
    return response.data;
  },

  updateLocation: async (lat, lng) => {
    // Assuming backend accepts { location: { lat, lng } } or similar
    // We send partial update if supported, or implementation depends on backend
    return api.put('/workers/profile/location', { lat, lng });
    // But for suggestion, specific endpoint is cleaner if available. 
    // If not, we fall back to generic profile update.
  },

  getDashboardStats: async () => {
    const response = await api.get('/workers/stats');
    return response.data;
  },

  // Jobs
  getAssignedJobs: async (params) => {
    const response = await api.get('/workers/jobs', { params });
    return response.data;
  },

  getJobById: async (id) => {
    const response = await api.get(`/workers/jobs/${id}`);
    return response.data;
  },

  updateJobStatus: async (id, status, data = {}) => {
    const response = await api.put(`/workers/jobs/${id}/status`, { status, ...data });
    return response.data;
  },

  startJob: async (id) => {
    const response = await api.post(`/workers/jobs/${id}/start`);
    return response.data;
  },

  workerReached: async (id) => {
    const response = await api.post(`/workers/jobs/${id}/reached`);
    return response.data;
  },

  completeJob: async (id, data = {}) => {
    const response = await api.post(`/workers/jobs/${id}/complete`, data);
    return response.data;
  },

  verifyVisit: async (id, otp, location) => {
    const response = await api.post(`/workers/jobs/${id}/visit/verify`, { otp, location });
    return response.data;
  },

  initiateCashCollection: async (id, totalAmount, extraItems = []) => {
    const response = await api.post(`/bookings/cash/${id}/initiate`, {
      totalAmount,
      extraItems
    });
    return response.data;
  },

  initiateOnlineCollection: async (id, totalAmount, extraItems = []) => {
    const response = await api.post(`/bookings/cash/${id}/initiate-online`, {
      totalAmount,
      extraItems
    });
    return response.data;
  },

  /**
   * Verify online collection (QR) and finalize
   */
  verifyOnlineCollection: async (id) => {
    const response = await api.post(`/bookings/cash/${id}/verify-online`);
    return response.data;
  },

  collectCash: async (id, otp, amount, extraItems = []) => {
    const response = await api.post(`/bookings/cash/${id}/confirm`, {
      otp,
      amount,
      extraItems
    });
    return response.data;
  },

  addJobNotes: async (id, notes) => {
    const response = await api.post(`/workers/jobs/${id}/notes`, { notes });
    return response.data;
  },

  respondToJob: async (id, status) => {
    const response = await api.put(`/workers/jobs/${id}/respond`, { status });
    return response.data;
  },

  // Notifications
  getNotifications: async (params) => {
    const response = await api.get('/notifications/worker', { params });
    return response.data;
  },

  markNotificationAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllNotificationsAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  deleteAllNotifications: async () => {
    const response = await api.delete('/notifications/delete-all');
    return response.data;
  }
};

export default workerService;

