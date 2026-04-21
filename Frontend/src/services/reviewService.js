import api from './api';

const reviewService = {
  // Get all reviews with pagination and filtering
  getAllReviews: async (params) => {
    try {
      const response = await api.get('/admin/reviews', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch reviews' };
    }
  },

  // Get review statistics
  getReviewStats: async () => {
    try {
      const response = await api.get('/admin/reviews/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch review statistics' };
    }
  },

  // Update review status (active, hidden, deleted)
  updateReviewStatus: async (id, status) => {
    try {
      const response = await api.patch(`/admin/reviews/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update review status' };
    }
  }
};

export default reviewService;
