import type {
  Specialty,
  Doctor,
  TimeSlot,
  Appointment,
  CreateAppointmentData,
  DoctorFormData,
  SpecialtyFormData,
  DashboardStats,
  DoctorDashboardStats,
  DoctorSchedule,
  DoctorScheduleInput,
} from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { headers: optionHeaders, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge any caller-provided headers
  if (optionHeaders) {
    if (optionHeaders instanceof Headers) {
      optionHeaders.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(optionHeaders)) {
      for (const [key, value] of optionHeaders) {
        headers[key] = value;
      }
    } else {
      Object.assign(headers, optionHeaders);
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'La solicitud falló' }));
    throw new Error(error.error || error.message || `HTTP ${response.status}`);
  }

  // 204 No Content — no body to parse
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Public API
export const specialtiesApi = {
  getAll: () => apiRequest<Specialty[]>('/specialties'),
  getById: (id: string) => apiRequest<Specialty>(`/specialties/${id}`),
};

export const doctorsApi = {
  getAll: (specialtyId?: string) => {
    const query = specialtyId ? `?specialtyId=${specialtyId}` : '';
    return apiRequest<Doctor[]>(`/doctors${query}`);
  },
  getById: (id: string) => apiRequest<Doctor>(`/doctors/${id}`),
  getSlots: (id: string, date: string) =>
    apiRequest<TimeSlot[]>(`/doctors/${id}/slots?date=${date}`),
};

export const appointmentsApi = {
  create: (data: CreateAppointmentData) =>
    apiRequest<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  verify: (appointmentId: string, code: string) =>
    apiRequest<Appointment>('/appointments/verify', {
      method: 'POST',
      body: JSON.stringify({ appointmentId, code }),
    }),
  getPending: (email: string, dni: string) =>
    apiRequest<{ appointment: Appointment | null }>(
      `/appointments/pending?email=${encodeURIComponent(email)}&dni=${encodeURIComponent(dni)}`,
    ),
  getPendingByToken: () =>
    apiRequest<{ appointment: Appointment | null }>('/appointments/pending-by-token'),
  resendCode: (id: string, email: string, dni: string) =>
    apiRequest<{ message: string }>(`/appointments/${id}/resend-code`, {
      method: 'POST',
      body: JSON.stringify({ email, dni }),
    }),
  getByPatient: (email: string, dni: string) =>
    apiRequest<Appointment[]>(
      `/appointments?email=${encodeURIComponent(email)}&dni=${encodeURIComponent(dni)}`,
    ),
  cancel: (id: string, email: string, dni: string) =>
    apiRequest<Appointment>(`/appointments/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ email, dni }),
    }),
  requestActionCode: (id: string, email: string, dni: string) =>
    apiRequest<{ message: string }>(`/appointments/${id}/request-action-code`, {
      method: 'POST',
      body: JSON.stringify({ email, dni }),
    }),
  cancelWithCode: (id: string, email: string, dni: string, code: string) =>
    apiRequest<Appointment>(`/appointments/${id}/cancel-with-code`, {
      method: 'POST',
      body: JSON.stringify({ email, dni, code }),
    }),
  reschedule: (id: string, email: string, dni: string, code: string, timeSlotId: string) =>
    apiRequest<Appointment>(`/appointments/${id}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify({ email, dni, code, timeSlotId }),
    }),
};

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ doctor: Doctor }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: () =>
    apiRequest<{ message: string }>('/auth/logout', {
      method: 'POST',
    }),
  getCurrentUser: () => apiRequest<Doctor>('/auth/me'),
};

// Admin API (authentication via HttpOnly cookie)
export const adminApi = {
  // Specialties
  getSpecialties: () => apiRequest<Specialty[]>('/admin/specialties'),
  createSpecialty: (data: SpecialtyFormData) =>
    apiRequest<Specialty>('/admin/specialties', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSpecialty: (id: string, data: Partial<SpecialtyFormData>) =>
    apiRequest<Specialty>(`/admin/specialties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteSpecialty: (id: string) =>
    apiRequest<void>(`/admin/specialties/${id}`, {
      method: 'DELETE',
    }),

  // Doctors
  getDoctors: () => apiRequest<Doctor[]>('/admin/doctors'),
  createDoctor: (data: DoctorFormData) =>
    apiRequest<Doctor>('/admin/doctors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateDoctor: (id: string, data: Partial<DoctorFormData>) =>
    apiRequest<Doctor>(`/admin/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteDoctor: (id: string) =>
    apiRequest<void>(`/admin/doctors/${id}`, {
      method: 'DELETE',
    }),

  // Appointments
  getAllAppointments: () => apiRequest<Appointment[]>('/admin/appointments'),
  createAppointment: (data: {
    doctorId: string;
    timeSlotId: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    patientDni: string;
  }) => apiRequest<Appointment>('/admin/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteAppointment: (id: string) =>
    apiRequest<{ message: string }>(`/admin/appointments/${id}`, {
      method: 'DELETE',
    }),
  cancelAppointment: (id: string) =>
    apiRequest<Appointment>(`/admin/appointments/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'CANCELLED' }),
    }),
  rescheduleAppointment: (id: string, timeSlotId: string) =>
    apiRequest<Appointment>(`/admin/appointments/${id}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify({ timeSlotId }),
    }),

  // Stats
  getStats: () => apiRequest<DashboardStats>('/admin/stats'),
};

// File upload helper (no JSON content-type — uses FormData)
async function apiUpload<T>(endpoint: string, formData: FormData): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'La solicitud falló' }));
    throw new Error(error.error || error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Doctor API (authentication via HttpOnly cookie)
export const doctorPanelApi = {
  getAppointments: () => apiRequest<Appointment[]>('/doctor/appointments'),

  getStats: () => apiRequest<DoctorDashboardStats>('/doctor/stats'),

  getAllSlots: (date: string) =>
    apiRequest<TimeSlot[]>(`/doctor/slots?date=${date}`),

  createSlots: (data: { date: string; slots: { startTime: string; endTime: string }[] }) =>
    apiRequest<TimeSlot[]>('/doctor/slots', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteSlot: (slotId: string) =>
    apiRequest<void>(`/doctor/slots/${slotId}`, {
      method: 'DELETE',
    }),

  updateAppointmentStatus: (
    appointmentId: string,
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED',
  ) =>
    apiRequest<Appointment>(`/doctor/appointments/${appointmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  deleteAppointment: (appointmentId: string) =>
    apiRequest<{ message: string }>(`/doctor/appointments/${appointmentId}`, {
      method: 'DELETE',
    }),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiUpload<{ url: string }>('/doctor/avatar', formData);
  },

  updateProfile: (data: { name?: string; bio?: string; avatar?: string }) =>
    apiRequest<Doctor>('/doctor/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getSchedule: () => apiRequest<DoctorSchedule[]>('/doctor/schedule'),

  updateSchedule: (schedules: DoctorScheduleInput[]) =>
    apiRequest<{ message: string }>('/doctor/schedule', {
      method: 'PUT',
      body: JSON.stringify({ schedules }),
    }),
};
