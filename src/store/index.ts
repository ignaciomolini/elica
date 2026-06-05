import { create } from 'zustand';
import type { Appointment, PatientInfo, TimeSlot } from '../types';
import { appointmentsApi } from '../services/api';

interface BookingState {
  selectedSpecialty: string | null;
  selectedDoctor: string | null;
  selectedDate: string | null;
  selectedTimeSlot: TimeSlot | null;
  patientInfo: PatientInfo;
  appointment: Appointment | null;
  isLoading: boolean;
  error: string | null;

  setSelectedSpecialty: (specialty: string | null) => void;
  setSelectedDoctor: (doctor: string | null) => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedTimeSlot: (slot: TimeSlot | null) => void;
  setPatientInfo: (info: Partial<PatientInfo>) => void;
  setAppointment: (appointment: Appointment | null) => void;
  createAppointment: () => Promise<void>;
  verifyAppointment: (code: string) => Promise<void>;
  recoverPending: (email: string, dni: string) => Promise<boolean>;
  setError: (error: string | null) => void;
  resetBooking: () => void;
}

const initialPatientInfo: PatientInfo = {
  name: '',
  email: '',
  phone: '',
  dni: '',
};

const initialState = {
  selectedSpecialty: null,
  selectedDoctor: null,
  selectedDate: null,
  selectedTimeSlot: null,
  patientInfo: { ...initialPatientInfo },
  appointment: null,
  isLoading: false,
  error: null,
};

export const useBookingStore = create<BookingState>((set, get) => ({
  ...initialState,

  setSelectedSpecialty: (specialty) => set({ selectedSpecialty: specialty }),
  setSelectedDoctor: (doctor) => set({ selectedDoctor: doctor }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTimeSlot: (slot) => set({ selectedTimeSlot: slot }),
  setPatientInfo: (info) =>
    set((state) => ({
      patientInfo: { ...state.patientInfo, ...info },
    })),
  setError: (error) => set({ error }),

  setAppointment: (appointment) => set({ appointment, error: null }),

  createAppointment: async () => {
    const { selectedDoctor, selectedTimeSlot, patientInfo } = get();
    if (!selectedDoctor || !selectedTimeSlot) return;

    set({ isLoading: true, error: null });
    try {
      const appointment = await appointmentsApi.create({
        doctorId: selectedDoctor,
        timeSlotId: selectedTimeSlot.id,
        patientName: patientInfo.name,
        patientEmail: patientInfo.email,
        patientPhone: patientInfo.phone,
        patientDni: patientInfo.dni,
      });
      set({ appointment, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear el turno';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  verifyAppointment: async (code: string) => {
    const { appointment } = get();
    if (!appointment) return;

    set({ isLoading: true, error: null });
    try {
      const verified = await appointmentsApi.verify(appointment.id, code);
      set({ appointment: verified, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'La verificación falló';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  recoverPending: async (email: string, dni: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await appointmentsApi.getPending(email, dni);
      if (result.appointment) {
        set({
          appointment: result.appointment,
          patientInfo: {
            name: result.appointment.patient?.name ?? '',
            email: result.appointment.patient?.email ?? email,
            phone: result.appointment.patient?.phone ?? '',
            dni: result.appointment.patient?.dni ?? dni,
          },
          isLoading: false,
        });
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al recuperar turno';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  resetBooking: () => set({ ...initialState, patientInfo: { ...initialPatientInfo } }),
}));
