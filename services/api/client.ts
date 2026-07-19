import axios from 'axios';
import { ENV } from '../../config/environment';
import { useAuthStore } from '../../store/authStore';
import { getCookie, setCookie, eraseCookie } from '../../lib/cookies';

export const apiClient = axios.create({
  baseURL: ENV.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token from Zustand Store or Cookies
apiClient.interceptors.request.use(
  (config) => {
    let token = useAuthStore.getState().token;
    if (!token) {
      token = getCookie('stadium_session');
    }
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Manage session invalidations and automatic token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Check if unauthorized (token expired / invalid) and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = getCookie('stadium_refresh');
      if (refreshToken) {
        try {
          // Call refresh endpoint using a fresh axios instance to avoid loops
          const refreshResponse = await axios.post(`${ENV.apiUrl}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          const { access_token } = refreshResponse.data;
          
          // Update Zustand store and cookies
          useAuthStore.setState({ token: access_token, isAuthenticated: true });
          setCookie('stadium_session', access_token, 1); // 1 day
          
          // Update authorization header and retry original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }
      
      // If we fall through (no refresh token, or refresh request failed), log out
      useAuthStore.getState().logout();
      eraseCookie('stadium_session');
      eraseCookie('stadium_refresh');
      
      // If we are on client side, redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login?expired=true';
      }
    }
    
    // Standardize error payload returned to services
    const apiError = {
      message: error.response?.data?.detail || error.response?.data?.message || error.message || 'An unexpected API error occurred',
      status: error.response?.status || 500,
      code: error.response?.data?.errorCode || 'API_ERROR',
      details: error.response?.data?.details || null,
    };
    
    return Promise.reject(apiError);
  }
);

export default apiClient;
