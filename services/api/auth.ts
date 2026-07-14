import apiClient from './client';
import { AuthSession, UserProfile } from '../../types/auth';
import { LoginInput } from '../../lib/validators';
import { ApiResponse } from '../../types/api';

export const AuthService = {
  login: async (credentials: LoginInput): Promise<ApiResponse<AuthSession>> => {
    const response = await apiClient.post<ApiResponse<AuthSession>>('/auth/login', credentials);
    return response.data;
  },
  getCurrentUser: async (): Promise<ApiResponse<UserProfile>> => {
    const response = await apiClient.get<ApiResponse<UserProfile>>('/auth/me');
    return response.data;
  },
  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/logout');
    return response.data;
  }
};

export default AuthService;
