import { create } from 'zustand';
import { User } from 'firebase/auth';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  
  // Organization Context
  currentOrganizationId: string | null;
  
  setUser: (user: User | null, token?: string) => void;
  setLoading: (isLoading: boolean) => void;
  setOrganizationId: (id: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
  currentOrganizationId: null,

  setUser: (user, token) => set({ 
    user, 
    isAuthenticated: !!user, 
    isLoading: false,
    ...(token && { token })
  }),

  setLoading: (isLoading) => set({ isLoading }),
  
  setOrganizationId: (id) => set({ currentOrganizationId: id }),

  logout: () => set({ 
    user: null, 
    isAuthenticated: false, 
    token: null, 
    currentOrganizationId: null 
  }),
}));
