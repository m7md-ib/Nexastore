import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '@/lib/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setAuth: (user, token) => {
        if (token) localStorage.setItem('nexastore_token', token);
        set({ user, token });
      },

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const { data } = await authAPI.login(credentials);
          const { token, ...user } = data.data;
          localStorage.setItem('nexastore_token', token);
          set({ user, token, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, message: err.response?.data?.message || 'Login failed' };
        }
      },

      register: async (credentials) => {
        set({ isLoading: true });
        try {
          const { data } = await authAPI.register(credentials);
          const { token, ...user } = data.data;
          localStorage.setItem('nexastore_token', token);
          set({ user, token, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, message: err.response?.data?.message || 'Registration failed' };
        }
      },

      logout: () => {
        localStorage.removeItem('nexastore_token');
        set({ user: null, token: null });
      },

      refreshUser: async () => {
        try {
          const { data } = await authAPI.getMe();
          set({ user: data.data });
        } catch {}
      },

      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),

      isAdmin: () => get().user?.role === 'admin',
      isLoggedIn: () => !!get().token,
    }),
    {
      name: 'nexastore-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useAuthStore;
