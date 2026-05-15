import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('quad-token') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('quad-token') : false,
  
  login: (user, token) => {
    localStorage.setItem('quad-token', token);
    set({ user, token, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('quad-token');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  setUser: (user) => set({ user }),
}));