import { create } from 'zustand';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  addMonths,
  subMonths,
  format,
} from 'date-fns';
import type { Appointment, DoctorSchedule } from '../types';
import { doctorPanelApi } from '../services/api';

export type ViewMode = 'day' | 'week' | 'month';

export interface PopupState {
  open: boolean;
  mode: 'create' | 'edit';
  date?: Date;
  time?: string;
  appointment?: Appointment;
}

interface CalendarState {
  viewMode: ViewMode;
  currentDate: Date;
  appointments: Appointment[];
  schedules: DoctorSchedule[];
  loading: boolean;
  error: string | null;
  popup: PopupState;

  setViewMode: (mode: ViewMode) => void;
  navigate: (direction: 'prev' | 'next') => void;
  goToToday: () => void;
  fetchAppointments: () => Promise<void>;
  fetchSchedules: () => Promise<void>;
  openPopup: (
    mode: 'create' | 'edit',
    date?: Date,
    time?: string,
    appointment?: Appointment,
  ) => void;
  closePopup: () => void;
}

function getDateRange(viewMode: ViewMode, currentDate: Date): { startDate: string; endDate: string } {
  switch (viewMode) {
    case 'day': {
      const day = startOfDay(currentDate);
      return {
        startDate: format(day, 'yyyy-MM-dd'),
        endDate: format(endOfDay(currentDate), 'yyyy-MM-dd'),
      };
    }
    case 'week': {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      return {
        startDate: format(weekStart, 'yyyy-MM-dd'),
        endDate: format(weekEnd, 'yyyy-MM-dd'),
      };
    }
    case 'month': {
      return {
        startDate: format(startOfMonth(currentDate), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(currentDate), 'yyyy-MM-dd'),
      };
    }
  }
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  viewMode: 'week',
  currentDate: new Date(),
  appointments: [],
  schedules: [],
  loading: false,
  error: null,
  popup: { open: false, mode: 'create' },

  setViewMode: (mode) => {
    set({ viewMode: mode });
    get().fetchAppointments();
  },

  navigate: (direction) => {
    const { viewMode, currentDate } = get();
    let newDate: Date;
    switch (viewMode) {
      case 'day':
        newDate = direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1);
        break;
      case 'week':
        newDate = direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1);
        break;
      case 'month':
        newDate = direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1);
        break;
    }
    set({ currentDate: newDate });
    get().fetchAppointments();
  },

  goToToday: () => {
    set({ currentDate: new Date() });
    get().fetchAppointments();
  },

  fetchAppointments: async () => {
    const { viewMode, currentDate } = get();
    const { startDate, endDate } = getDateRange(viewMode, currentDate);
    set({ loading: true, error: null });
    try {
      const appointments = await doctorPanelApi.getAppointments({ startDate, endDate });
      set({ appointments, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar los turnos';
      set({ error: message, loading: false });
    }
  },

  fetchSchedules: async () => {
    try {
      const schedules = await doctorPanelApi.getSchedule();
      set({ schedules });
    } catch {
      // Schedules are nice-to-have; don't block the UI
    }
  },

  openPopup: (mode, date, time, appointment) => {
    set({
      popup: { open: true, mode, date, time, appointment },
    });
  },

  closePopup: () => {
    set({ popup: { open: false, mode: 'create' } });
  },
}));