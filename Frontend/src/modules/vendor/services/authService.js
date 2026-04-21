import api from '../../../services/api';
import { registerFCMToken } from '../../../services/pushNotificationService';

/**
 * Notify Flutter WebView about successful login
 * This directly calls Flutter's captureLoginResponse handler
 * @param {object} responseData - The login response data containing accessToken and vendor info
 */
function notifyFlutterLogin(responseData) {
  try {
    if (window.flutter_inappwebview && window.flutter_inappwebview.callHandler) {
      console.log('[VENDOR AUTH] Notifying Flutter about login with verify-login response');
      window.flutter_inappwebview.callHandler('captureLoginResponse', JSON.stringify({
        url: '/auth/verify-login',
        body: responseData
      }));
    }
  } catch (e) {
    console.error('[VENDOR AUTH] Error notifying Flutter:', e);
  }
}

/**
 * Send OTP for vendor authentication
 * @param {string} phone - Phone number
 * @returns {Promise<Object>} OTP response with token
 */
export const sendOTP = async (phone) => {
  try {
    const response = await api.post('/vendors/auth/send-otp', { phone });
    return response.data;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

/**
 * Verify Login (Unified Flow)
 */
export const verifyLogin = async (data) => {
  try {
    const response = await api.post('/vendors/auth/verify-login', data);

    // Check if vendor is pending approval
    const isPending = response.data.vendor?.adminApproval?.toLowerCase() === 'pending';

    if (response.data.success && !response.data.isNewUser && response.data.accessToken && !isPending) {
      localStorage.setItem('vendorAccessToken', response.data.accessToken);
      localStorage.setItem('vendorRefreshToken', response.data.refreshToken);
      localStorage.setItem('vendorData', JSON.stringify(response.data.vendor));

      // Notify Flutter about the login for mobile app FCM token handling
      notifyFlutterLogin(response.data);

      // Register FCM token after successful login
      console.log('[VENDOR AUTH] Vendor login successful via verify-login, registering FCM token...');
      registerFCMToken('vendor', true).catch(err => {
        console.error('[VENDOR AUTH] FCM token registration failed:', err);
      });
    }
    return response.data;
  } catch (error) {
    console.error('Error verifying login:', error);
    throw error;
  }
};

/**
 * Login vendor with OTP
 * @param {Object} credentials - Login credentials (phone, otp, token)
 * @returns {Promise<Object>} Auth response with token and vendor data
 */
export const login = async (credentials) => {
  try {
    const response = await api.post('/vendors/auth/login', credentials);

    // Store tokens in localStorage
    if (response.data.success && response.data.accessToken) {
      localStorage.setItem('vendorAccessToken', response.data.accessToken);
      localStorage.setItem('vendorRefreshToken', response.data.refreshToken);
      localStorage.setItem('vendorData', JSON.stringify(response.data.vendor));
    }

    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

/**
 * Logout vendor
 * @returns {Promise<boolean>} Success status
 */
export const logout = async () => {
  try {
    const response = await api.post('/vendors/auth/logout');

    // Clear tokens
    localStorage.removeItem('vendorAccessToken');
    localStorage.removeItem('vendorRefreshToken');
    localStorage.removeItem('vendorData');

    return response.data;
  } catch (error) {
    console.error('Error logging out:', error);
    // Clear tokens anyway
    localStorage.removeItem('vendorAccessToken');
    localStorage.removeItem('vendorRefreshToken');
    localStorage.removeItem('vendorData');
    throw error;
  }
};

/**
 * Register new vendor
 * @param {Object} vendorData - Vendor registration data
 * @returns {Promise<Object>} Auth response with token and user data
 */
export const register = async (vendorData) => {
  try {
    console.log('Calling vendor register API with data:', vendorData);
    const response = await api.post('/vendors/auth/register', vendorData);
    console.log('Vendor register API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error registering vendor:', error);
    throw error;
  }
};

/**
 * Get current vendor profile
 * @returns {Promise<Object>} Vendor profile
 */
export const getCurrentVendor = async () => {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/auth/me`, {
    //   headers: {
    //     'Authorization': `Bearer ${localStorage.getItem('vendorToken')}`,
    //   },
    // });
    // return await response.json();

    // Mock implementation
    const profile = JSON.parse(localStorage.getItem('vendorProfile') || '{}');
    return profile;
  } catch (error) {
    console.error('Error fetching current vendor:', error);
    throw error;
  }
};

/**
 * Update vendor profile
 * @param {Object} profileData - Updated profile data
 * @returns {Promise<Object>} Updated vendor profile
 */
export const updateProfile = async (profileData) => {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${localStorage.getItem('vendorToken')}`,
    //   },
    //   body: JSON.stringify(profileData),
    // });
    // return await response.json();

    // Mock implementation
    const existing = JSON.parse(localStorage.getItem('vendorProfile') || '{}');
    const updated = { ...existing, ...profileData, updatedAt: new Date().toISOString() };
    localStorage.setItem('vendorProfile', JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Change password
 * @param {Object} passwordData - Current and new password
 * @returns {Promise<boolean>} Success status
 */
export const changePassword = async (passwordData) => {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${localStorage.getItem('vendorToken')}`,
    //   },
    //   body: JSON.stringify(passwordData),
    // });
    // return await response.json();

    // Mock implementation
    return { success: true };
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

/**
 * Request password reset
 * @param {string} email - Vendor email
 * @returns {Promise<boolean>} Success status
 */
export const requestPasswordReset = async (email) => {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email }),
    // });
    // return await response.json();

    // Mock implementation
    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
};

/**
 * Verify token validity
 * @returns {Promise<boolean>} Token validity
 */
export const verifyToken = async () => {
  try {
    // TODO: Replace with actual API call
    // const token = localStorage.getItem('vendorToken');
    // if (!token) return false;
    // 
    // const response = await fetch(`${API_BASE_URL}/auth/verify`, {
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //   },
    // });
    // return response.ok;

    // Mock implementation
    return !!localStorage.getItem('vendorToken');
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
};

