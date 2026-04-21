import api from './api';

/**
 * Worker Bill Service
 * Handles final billing by workers using catalog items and custom items
 */
const workerBillService = {
  /**
   * Create or Update a bill for a job
   */
  createOrUpdateBill: async (jobId, billData) => {
    const response = await api.post(`/workers/jobs/${jobId}/bill`, billData);
    return response.data;
  },

  /**
   * Get bill details for a job
   */
  getBill: async (jobId) => {
    const response = await api.get(`/workers/jobs/${jobId}/bill`);
    return response.data;
  },

  /**
   * Get service catalog for billing
   */
  getServiceCatalog: async () => {
    const response = await api.get('/workers/catalog/services');
    return response.data;
  },

  /**
   * Get parts catalog for billing
   */
  getPartsCatalog: async () => {
    const response = await api.get('/workers/catalog/parts');
    return response.data;
  }
};

export default workerBillService;
