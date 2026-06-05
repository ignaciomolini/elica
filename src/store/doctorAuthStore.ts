import { create } from 'zustand';
import type { Doctor } from '../types';
import { authApi } from '../services/api';

interface DoctorAuthState {
  doctor: Doctor | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isChecking: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setDoctor: (doctor: Doctor) => void;
}

export const useDoctorAuthStore = create<DoctorAuthState>((set) => ({
  doctor: null,
  isAuthenticated: false,
  isLoading: false,
  isChecking: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(email, password);
      if (response.doctor.role !== 'DOCTOR') {
        throw new Error('Acceso denegado. Esta cuenta no tiene rol de medico.');
      }
      set({
        doctor: response.doctor,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al iniciar sesion';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({ doctor: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    set({ isChecking: true });
    try {
      const doctor = await authApi.getCurrentUser();
      if (doctor.role !== 'DOCTOR') {
        throw new Error('No autorizado');
      }
      set({ doctor, isAuthenticated: true, isChecking: false });
    } catch {
      set({ doctor: null, isAuthenticated: false, isChecking: false });
    }
  },

  clearError: () => set({ error: null }),

  setDoctor: (doctor: Doctor) => set({ doctor }),
}));
