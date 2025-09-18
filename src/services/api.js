const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to set auth token in localStorage
const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Helper function to remove auth token from localStorage
const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

// Helper function to get headers with authorization
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Authorization': token ? `Token ${token}` : '',
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    const error = new Error(data.message || data.error || 'An error occurred');
    error.status = response.status;
    error.details = data;
    throw error;
  }
  
  return data;
};

// Authentication API calls
export const authAPI = {
  // Register a new user with car information
  register: async (userData, photos) => {
    const formData = new FormData();
    
    // Add user data to FormData
    Object.keys(userData).forEach(key => {
      if (userData[key] !== null && userData[key] !== undefined) {
        formData.append(key, userData[key]);
      }
    });
    
    // Add photos to FormData
    photos.forEach((photo, index) => {
      if (photo instanceof File) {
        formData.append('photos', photo);
      } else {
        console.error(`Photo ${index} is not a File object:`, photo)
      }
    });
    
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await handleResponse(response);
    
    // Store token if registration successful
    if (data.token) {
      setAuthToken(data.token);
    }
    
    return data;
  },

  // Login user
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await handleResponse(response);
    
    // Store token if login successful
    if (data.token) {
      setAuthToken(data.token);
    }
    
    return data;
  },

  // Logout user
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    
    const data = await handleResponse(response);
    
    // Remove token from localStorage
    removeAuthToken();
    
    return data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    
    return handleResponse(response);
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getAuthToken();
  },

  // Get current auth token
  getToken: getAuthToken,

  // Set auth token
  setToken: setAuthToken,

  // Remove auth token
  removeToken: removeAuthToken,
};

// Cars API calls
export const carsAPI = {
  // Get car brands
  getBrands: async () => {
    const response = await fetch(`${API_BASE_URL}/cars/brands/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse(response);
  },

  // Get car models for a brand
  getModels: async (brandId) => {
    const response = await fetch(`${API_BASE_URL}/cars/brands/${brandId}/models/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse(response);
  },

  // Get car variants for a model
  getVariants: async (modelId) => {
    const response = await fetch(`${API_BASE_URL}/cars/models/${modelId}/variants/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse(response);
  },

  // Get car types
  getCarTypes: async () => {
    const response = await fetch(`${API_BASE_URL}/cars/types/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return handleResponse(response);
  },
};

export default { authAPI, carsAPI };