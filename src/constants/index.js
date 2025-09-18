// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register/',
    LOGIN: '/auth/login/',
    LOGOUT: '/auth/logout/',
    PROFILE: '/auth/profile/',
    PROFILE_UPDATE: '/auth/profile/update/',
    CHANGE_PASSWORD: '/auth/change-password/',
    CHECK_EMAIL: '/auth/check-email/',
    CHECK_PHONE: '/auth/check-phone/',
  },
  
  // Cars
  CARS: {
    BRANDS: '/cars/brands/',
    BRANDS_WITH_MODELS: '/cars/brands-with-models/',
    MODELS_FOR_BRAND: (brandId) => `/cars/brands/${brandId}/models/`,
    VARIANTS_FOR_MODEL: (modelId) => `/cars/models/${modelId}/variants/`,
    TYPES: '/cars/types/',
    MY_CARS: '/cars/my-cars/',
    REGISTER: '/cars/register/',
    DETAIL: (carId) => `/cars/${carId}/`,
    UPDATE: (carId) => `/cars/${carId}/update/`,
    DELETE: (carId) => `/cars/${carId}/delete/`,
    ADD_PHOTOS: (carId) => `/cars/${carId}/photos/add/`,
    DELETE_PHOTO: (carId, photoId) => `/cars/${carId}/photos/${photoId}/delete/`,
  },
  
  // Trips (to be implemented)
  TRIPS: {
    LIST: '/trips/',
    CREATE: '/trips/create/',
    DETAIL: (tripId) => `/trips/${tripId}/`,
    UPDATE: (tripId) => `/trips/${tripId}/update/`,
    DELETE: (tripId) => `/trips/${tripId}/delete/`,
    JOIN: (tripId) => `/trips/${tripId}/join/`,
    LEAVE: (tripId) => `/trips/${tripId}/leave/`,
  }
};

// User Tiers
export const USER_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise',
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  TRIPS: '/trips',
  CREATE_TRIP: '/create-trip',
  TRIP_DETAIL: '/trip/:id',
  PROFILE: '/profile',
  ADMIN: '/admin',
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'CruiseLink',
  PHOTOS: {
    MIN_COUNT: 2,
    MAX_COUNT: 5,
    MAX_SIZE_MB: 10,
    ACCEPTED_FORMATS: ['image/jpeg', 'image/png', 'image/gif'],
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
  },
};