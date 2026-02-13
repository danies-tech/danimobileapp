import { create } from 'zustand';

type AuthState = {
  token: string | null;
  role: 'customer' | 'admin' | null;
  setAuth: (token: string, role?: 'customer' | 'admin') => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  role: null,
  setAuth: (token, role = 'customer') => set({ token, role }),
  logout: () => set({ token: null, role: null }),
}));
