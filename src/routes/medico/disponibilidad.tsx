import { createFileRoute } from '@tanstack/react-router';
import { DoctorProtectedRoute } from '../../components/doctor/ProtectedRoute';
import { DoctorLayout } from '../../components/doctor/DoctorLayout';
import { DoctorAvailability } from '../../pages/doctor/Availability';

export const Route = createFileRoute('/medico/disponibilidad')({
  component: () => (
    <DoctorProtectedRoute>
      <DoctorLayout>
        <DoctorAvailability />
      </DoctorLayout>
    </DoctorProtectedRoute>
  ),
});
