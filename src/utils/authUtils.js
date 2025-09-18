// Error handling utilities for API calls
export const handleAPIError = (error) => {
  console.error('API Error:', error);
  
  if (error.message.includes('Failed to fetch')) {
    return 'Unable to connect to server. Please check your internet connection.';
  }
  
  if (error.message.includes('401')) {
    return 'Your session has expired. Please login again.';
  }
  
  if (error.message.includes('403')) {
    return 'You do not have permission to perform this action.';
  }
  
  if (error.message.includes('400')) {
    // For 400 errors, try to extract validation details
    if (error.details && typeof error.details === 'object') {
      const errorMessages = [];
      Object.keys(error.details).forEach(field => {
        const fieldErrors = Array.isArray(error.details[field]) 
          ? error.details[field] 
          : [error.details[field]];
        fieldErrors.forEach(msg => {
          errorMessages.push(`${field}: ${msg}`);
        });
      });
      return errorMessages.join(', ');
    }
    return 'Invalid data provided. Please check your input and try again.';
  }
  
  if (error.message.includes('500')) {
    return 'Server error. Please try again later.';
  }
  
  return error.message || 'An unexpected error occurred.';
};

// Token validation utilities
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Basic token validation - in production you might want to decode JWT
    // For Django Token auth, we'll rely on server-side validation
    return false;
  } catch (error) {
    return true;
  }
};

// Auth state management helpers
export const getStoredUser = () => {
  try {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    return null;
  }
};

export const setStoredUser = (userData) => {
  try {
    localStorage.setItem('userData', JSON.stringify(userData));
  } catch (error) {
    console.error('Error storing user data:', error);
  }
};

export const clearStoredUser = () => {
  localStorage.removeItem('userData');
  localStorage.removeItem('authToken');
};

// Check if error indicates session expiration
export const isSessionExpiredError = (error) => {
  if (!error) return false
  
  const errorStr = error.toString().toLowerCase()
  return errorStr.includes('401') || 
         errorStr.includes('unauthorized') ||
         errorStr.includes('session') ||
         errorStr.includes('token')
}

export default {
  handleAPIError,
  isTokenExpired,
  getStoredUser,
  setStoredUser,
  clearStoredUser,
  isSessionExpiredError
};