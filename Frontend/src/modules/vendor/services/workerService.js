/**
 * Worker Service
 * Handles all worker management API calls
 */

import api from '../../../services/api';

/**
 * Get all workers for the vendor
 * @param {Object} filters - Filter options (availability, skills, etc.)
 * @returns {Promise<Object>} Workers data with success status
 */
export const getWorkers = async (filters = {}) => {
  try {
    const response = await api.get('/vendors/workers', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching workers:', error);
    throw error;
  }
};

/**
 * Get worker by ID
 * @param {string} workerId - Worker ID
 * @returns {Promise<Object>} Worker details
 */
export const getWorkerById = async (workerId) => {
  try {
    const response = await api.get(`/vendors/workers/${workerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching worker:', error);
    throw error;
  }
};

/**
 * Link existing worker
 * @param {string} phone - Worker phone number
 * @returns {Promise<Object>} Linked worker
 */
export const linkWorker = async (phone) => {
  try {
    const response = await api.post('/vendors/workers/link', { phone });
    return response.data;
  } catch (error) {
    console.error('Error linking worker:', error);
    throw error;
  }
};

/**
 * Create a new worker
 * @param {Object} workerData - Worker information
 * @returns {Promise<Object>} Created worker
 */
export const createWorker = async (workerData) => {
  try {
    const response = await api.post('/vendors/workers', workerData);
    return response.data;
  } catch (error) {
    console.error('Error creating worker:', error);
    throw error;
  }
};

/**
 * Update worker
 * @param {string} workerId - Worker ID
 * @param {Object} workerData - Updated worker information
 * @returns {Promise<Object>} Updated worker
 */
export const updateWorker = async (workerId, workerData) => {
  try {
    const response = await api.put(`/vendors/workers/${workerId}`, workerData);
    return response.data;
  } catch (error) {
    console.error('Error updating worker:', error);
    throw error;
  }
};

/**
 * Delete worker
 * @param {string} workerId - Worker ID
 * @returns {Promise<Object>} Success response
 */
export const deleteWorker = async (workerId) => {
  try {
    const response = await api.delete(`/vendors/workers/${workerId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting worker:', error);
    throw error;
  }
};

/**
 * Get worker performance statistics
 * @param {string} workerId - Worker ID
 * @returns {Promise<Object>} Worker performance data
 */
export const getWorkerPerformance = async (workerId) => {
  try {
    const response = await api.get(`/vendors/workers/${workerId}/performance`);
    return response.data;
  } catch (error) {
    console.error('Error fetching worker performance:', error);
    throw error;
  }
};

