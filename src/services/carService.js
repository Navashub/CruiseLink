import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants';

export const carService = {
  // Get all car brands
  getBrands: async () => {
    return await apiClient.get(API_ENDPOINTS.CARS.BRANDS);
  },

  // Get brands with models
  getBrandsWithModels: async () => {
    return await apiClient.get(API_ENDPOINTS.CARS.BRANDS_WITH_MODELS);
  },

  // Get models for a brand
  getModelsForBrand: async (brandId) => {
    return await apiClient.get(API_ENDPOINTS.CARS.MODELS_FOR_BRAND(brandId));
  },

  // Get variants for a model
  getVariantsForModel: async (modelId) => {
    return await apiClient.get(API_ENDPOINTS.CARS.VARIANTS_FOR_MODEL(modelId));
  },

  // Get car types
  getCarTypes: async () => {
    return await apiClient.get(API_ENDPOINTS.CARS.TYPES);
  },

  // Get user's cars
  getMyCars: async () => {
    return await apiClient.get(API_ENDPOINTS.CARS.MY_CARS);
  },

  // Register a car
  registerCar: async (carData) => {
    return await apiClient.post(API_ENDPOINTS.CARS.REGISTER, carData);
  },

  // Get car details
  getCarDetail: async (carId) => {
    return await apiClient.get(API_ENDPOINTS.CARS.DETAIL(carId));
  },

  // Update car
  updateCar: async (carId, carData) => {
    return await apiClient.put(API_ENDPOINTS.CARS.UPDATE(carId), carData);
  },

  // Delete car
  deleteCar: async (carId) => {
    return await apiClient.delete(API_ENDPOINTS.CARS.DELETE(carId));
  },

  // Add photos to car
  addPhotos: async (carId, photos) => {
    const formData = new FormData();
    photos.forEach(photo => {
      formData.append('photos', photo);
    });
    return await apiClient.post(API_ENDPOINTS.CARS.ADD_PHOTOS(carId), formData);
  },

  // Delete a photo
  deletePhoto: async (carId, photoId) => {
    return await apiClient.delete(API_ENDPOINTS.CARS.DELETE_PHOTO(carId, photoId));
  },
};