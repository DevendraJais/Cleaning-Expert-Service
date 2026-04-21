import api from './api';

/**
 * Vendor Bill Service
 * Handles final billing using catalog items and custom items
 */
const vendorBillService = {
  /**
   * Create or Update a bill for a booking
   */
  createOrUpdateBill: async (bookingId, billData) => {
    const response = await api.post(`/vendors/bookings/${bookingId}/bill`, billData);
    return response.data;
  },

  /**
   * Get bill details for a booking
   */
  getBill: async (bookingId) => {
    const response = await api.get(`/vendors/bookings/${bookingId}/bill`);
    return response.data;
  },

  /**
   * Get service catalog for billing
   */
  getServiceCatalog: async () => {
    const response = await api.get('/vendors/catalog/services');
    return response.data;
  },

  /**
   * Get parts catalog for billing
   */
  getPartsCatalog: async () => {
    const response = await api.get('/vendors/catalog/parts');
    return response.data;
  }
};

export default vendorBillService;
