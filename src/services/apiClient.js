import { API_BASE_URL, API_ENDPOINTS } from '../constants';

// Base API client
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('authToken'); // Changed from 'token' to 'authToken'
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Token ${token}`;
    }

    // Handle FormData - remove Content-Type header to let browser set it
    if (config.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Create a more detailed error object for better handling
        const error = new Error(data.message || data.error || 'Request failed');
        error.status = response.status;
        error.details = data;
        throw error;
      }

      return data;
    } catch (error) {
      // If it's already our custom error, rethrow it
      if (error.status) {
        throw error;
      }
      // Otherwise create a network error
      throw new Error(error.message || 'Network error');
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

export const apiClient = new ApiClient();