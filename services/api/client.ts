import axios from 'axios';
import { ENV } from '../../config/environment';
import { useAuthStore } from '../../store/authStore';

export const apiClient = axios.create({
  baseURL: ENV.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token from Zustand Store
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Manage session invalidations and structural mappings
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Check if unauthorized (token expired / invalid)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Auto logout the user and direct them to auth boundary
      useAuthStore.getState().logout();
      
      // If we are on client side, we can redirect or trigger toast
      if (typeof window !== 'undefined') {
        window.location.href = '/login?expired=true';
      }
    }
    
    // Standardize error payload returned to services
    const apiError = {
      message: error.response?.data?.message || error.message || 'An unexpected API error occurred',
      status: error.response?.status || 500,
      code: error.response?.data?.errorCode || 'API_ERROR',
      details: error.response?.data?.details || null,
    };
    
    return Promise.reject(apiError);
  }
);

export default apiClient;
