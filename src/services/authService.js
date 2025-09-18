import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants';

export const authService = {
  // Register new user with car and photos
  register: async (formData) => {
    return await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, formData);
  },

  // Login user
  login: async (credentials) => {
    return await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  },

  // Logout user
  logout: async () => {
    return await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  // Get user profile
  getProfile: async () => {
    return await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return await apiClient.put(API_ENDPOINTS.AUTH.PROFILE_UPDATE, profileData);
  },

  // Change password
  changePassword: async (passwordData) => {
    return await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData);
  },

  // Check email availability
  checkEmailAvailability: async (email) => {
    return await apiClient.get(`${API_ENDPOINTS.AUTH.CHECK_EMAIL}?email=${email}`);
  },

  // Check phone availability
  checkPhoneAvailability: async (phone) => {
    return await apiClient.get(`${API_ENDPOINTS.AUTH.CHECK_PHONE}?phone=${phone}`);
  },
};