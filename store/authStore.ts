import { create } from 'zustand';
import { UserProfile, AuthSession } from '../types/auth';

interface AuthStoreState {
  isAuthenticated: boolean;
  token: string | null;
  user: UserProfile | null;
  login: (session: AuthSession) => void;
  logout: () => void;
  updateUser: (user: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  isAuthenticated: false,
  token: null,
  user: null,
  login: (session) => set({
    isAuthenticated: true,
    token: session.token,
    user: session.user
  }),
  logout: () => set({
    isAuthenticated: false,
    token: null,
    user: null
  }),
  updateUser: (updatedUser) => set((state) => ({
    user: state.user ? { ...state.user, ...updatedUser } : null
  }))
}));
export default useAuthStore;
