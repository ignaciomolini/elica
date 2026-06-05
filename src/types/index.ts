export interface Specialty {
  id: string;
  name: string;
  description: string;
  icon: string;
  doctors?: { id: string; name: string }[];
}

export interface Doctor {
  id: string;
  name: string;
  email?: string;
  role?: string;
  avatar: string;
  bio: string;
  specialties: { id: string; name: string }[];
}

export interface TimeSlot {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface AppointmentDoctor {
  id: string;
  name: string;
  avatar?: string;
  specialties: { id: string; name: string }[];
}

export interface AppointmentPatient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dni?: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  timeSlotId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  verificationCode?: string;
  verified: boolean;
  expiresAt?: string;
  doctor?: AppointmentDoctor;
  patient?: AppointmentPatient;
}

export interface PatientInfo {
  name: string;
  email: string;
  phone: string;
  dni: string;
}

export interface CreateAppointmentData {
  doctorId: string;
  timeSlotId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientDni: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  doctor: Doctor;
}

export interface DoctorFormData {
  name: string;
  email: string;
  password?: string;
  bio: string;
  avatar: string;
  specialtyIds: string[];
}

export interface SpecialtyFormData {
  name: string;
  description: string;
  icon: string;
}

export interface DashboardStats {
  totalDoctors: number;
  totalSpecialties: number;
  totalAppointments: number;
  pendingAppointments: number;
}

export interface DoctorDashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  todayAppointments: number;
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  interval: number;
  enabled: boolean;
}

export interface DoctorScheduleInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  interval: number;
  enabled: boolean;
}
