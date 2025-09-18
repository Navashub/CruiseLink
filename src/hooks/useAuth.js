import { useState, useEffect } from 'react';
import { authService } from '../services';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');
      
      if (token) {
        try {
          // Try to fetch fresh user data from server
          const profileData = await authService.getProfile();
          setUser(profileData);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(profileData));
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Fallback to saved user data if server request fails
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
              setIsAuthenticated(true);
            } catch (parseError) {
              console.error('Error parsing saved user:', parseError);
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
            }
          } else {
            // No saved user and server request failed, clear token
            localStorage.removeItem('authToken');
          }
        }
      }
      setIsLoading(false);
    };
    
    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const { user, token } = response;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (registrationData) => {
    try {
      const response = await authService.register(registrationData);
      const { user, token } = response;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const refreshUser = async () => {
    try {
      const profileData = await authService.getProfile();
      setUser(profileData);
      localStorage.setItem('user', JSON.stringify(profileData));
      return profileData;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      throw error;
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };
};