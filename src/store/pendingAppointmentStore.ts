import { create } from 'zustand';
import type { Appointment } from '../types';
import { appointmentsApi } from '../services/api';

interface PendingAppointmentState {
  pendingAppointment: Appointment | null;
  isLoading: boolean;
  checkPending: () => Promise<void>;
  clearPending: () => void;
}

export const usePendingAppointmentStore = create<PendingAppointmentState>((set) => ({
  pendingAppointment: null,
  isLoading: false,

  checkPending: async () => {
    set({ isLoading: true });
    try {
      const result = await appointmentsApi.getPendingByToken();
      set({ pendingAppointment: result.appointment, isLoading: false });
    } catch {
      set({ pendingAppointment: null, isLoading: false });
    }
  },

  clearPending: () => set({ pendingAppointment: null }),
}));
