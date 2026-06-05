import { createFileRoute } from '@tanstack/react-router';
import { DoctorProtectedRoute } from '../../components/doctor/ProtectedRoute';
import { DoctorLayout } from '../../components/doctor/DoctorLayout';
import { DoctorAppointments } from '../../pages/doctor/Appointments';

export const Route = createFileRoute('/medico/turnos')({
  component: () => (
    <DoctorProtectedRoute>
      <DoctorLayout>
        <DoctorAppointments />
      </DoctorLayout>
    </DoctorProtectedRoute>
  ),
});
