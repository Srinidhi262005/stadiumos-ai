import apiClient from './client';
import { AuthSession, UserProfile, UserRole } from '../../types/auth';
import { LoginInput } from '../../lib/validators';
import { ApiResponse } from '../../types/api';
import { useAuthStore } from '../../store/authStore';
import { setCookie, eraseCookie } from '../../lib/cookies';

export const AuthService = {
  login: async (credentials: LoginInput): Promise<ApiResponse<AuthSession>> => {
    // 1. Call login endpoint
    const loginResponse = await apiClient.post<any>('/auth/login', credentials);
    const { access_token, refresh_token } = loginResponse.data;
    
    // Save tokens in cookies for session persistence
    setCookie('stadium_session', access_token, 1); // 1 day
    setCookie('stadium_refresh', refresh_token, 7); // 7 days
    
    // Temporarily save token in Zustand store so subsequent requests are authorized
    useAuthStore.setState({ token: access_token });
    
    // 2. Fetch current user info
    const userResponse = await apiClient.get<any>('/auth/me');
    const dbUser = userResponse.data;
    
    const user: UserProfile = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.email.split('@')[0], // Derive fallback name
      role: dbUser.role as UserRole,
      permissions: dbUser.role === 'admin' ? ['admin', 'ops', 'volunteer'] : [dbUser.role]
    };
    
    const session: AuthSession = {
      token: access_token,
      expiresAt: Date.now() + 30 * 60 * 1000,
      user
    };
    
    // Update store state
    useAuthStore.getState().login(session);
    
    return {
      success: true,
      data: session,
      timestamp: new Date().toISOString()
    };
  },
  getCurrentUser: async (): Promise<ApiResponse<UserProfile>> => {
    const response = await apiClient.get<any>('/auth/me');
    const dbUser = response.data;
    
    const user: UserProfile = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.email.split('@')[0],
      role: dbUser.role as UserRole,
      permissions: dbUser.role === 'admin' ? ['admin', 'ops', 'volunteer'] : [dbUser.role]
    };
    
    return {
      success: true,
      data: user,
      timestamp: new Date().toISOString()
    };
  },
  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    let responseData = { message: 'Logged out locally' };
    try {
      const response = await apiClient.post<any>('/auth/logout');
      responseData = response.data;
    } catch (e) {
      console.warn('Backend logout failed or not supported:', e);
    }
    
    // Clear cookies
    eraseCookie('stadium_session');
    eraseCookie('stadium_refresh');
    
    // Clear Zustand store
    useAuthStore.getState().logout();
    
    return {
      success: true,
      data: responseData,
      timestamp: new Date().toISOString()
    };
  }
};

export default AuthService;

