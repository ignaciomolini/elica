import { createFileRoute } from '@tanstack/react-router';
import { MyAppointments } from '../pages/MyAppointments';

export const Route = createFileRoute('/mis-turnos')({
  component: MyAppointments,
});
