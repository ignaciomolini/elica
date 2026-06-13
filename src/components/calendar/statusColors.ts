import type { Appointment } from '../../types';

type AppointmentStatus = Appointment['status'];

interface StatusStyle {
  bg: string;
  border: string;
  text: string;
  label: string;
}

const statusColorMap: Record<AppointmentStatus, StatusStyle> = {
  PENDING: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    label: 'Pendiente',
  },
  CONFIRMED: {
    bg: 'bg-primary-50',
    border: 'border-primary-200',
    text: 'text-primary-800',
    label: 'Confirmado',
  },
  CANCELLED: {
    bg: 'bg-red-50/50',
    border: 'border-red-200/50',
    text: 'text-red-400',
    label: 'Cancelado',
  },
};

export function getStatusColors(status: AppointmentStatus): StatusStyle {
  return statusColorMap[status] ?? statusColorMap.PENDING;
}

export function getStatusCellClasses(status: AppointmentStatus): string {
  const style = getStatusColors(status);
  return `${style.bg} ${style.border} ${style.text}`;
}