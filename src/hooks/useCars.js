import { useState, useEffect } from 'react';
import { carService } from '../services';

export const useCars = () => {
  const [cars, setCars] = useState([]);
  const [brands, setBrands] = useState([]);
  const [carTypes, setCarTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial data
  useEffect(() => {
    fetchBrands();
    fetchCarTypes();
  }, []);

  const fetchBrands = async () => {
    try {
      setIsLoading(true);
      const brandsData = await carService.getBrands();
      setBrands(brandsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCarTypes = async () => {
    try {
      const typesData = await carService.getCarTypes();
      setCarTypes(typesData);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchMyCars = async () => {
    try {
      setIsLoading(true);
      const carsData = await carService.getMyCars();
      setCars(carsData);
      return carsData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getModelsForBrand = async (brandId) => {
    try {
      return await carService.getModelsForBrand(brandId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getVariantsForModel = async (modelId) => {
    try {
      return await carService.getVariantsForModel(modelId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const registerCar = async (carData) => {
    try {
      const response = await carService.registerCar(carData);
      // Refresh cars list
      await fetchMyCars();
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateCar = async (carId, carData) => {
    try {
      const response = await carService.updateCar(carId, carData);
      // Refresh cars list
      await fetchMyCars();
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCar = async (carId) => {
    try {
      await carService.deleteCar(carId);
      // Remove from local state
      setCars(prev => prev.filter(car => car.id !== carId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    cars,
    brands,
    carTypes,
    isLoading,
    error,
    fetchMyCars,
    getModelsForBrand,
    getVariantsForModel,
    registerCar,
    updateCar,
    deleteCar,
    clearError: () => setError(null),
  };
};