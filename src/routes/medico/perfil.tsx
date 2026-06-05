import { createFileRoute } from '@tanstack/react-router';
import { DoctorProtectedRoute } from '../../components/doctor/ProtectedRoute';
import { DoctorLayout } from '../../components/doctor/DoctorLayout';
import { DoctorProfile } from '../../pages/doctor/Profile';

export const Route = createFileRoute('/medico/perfil')({
  component: () => (
    <DoctorProtectedRoute>
      <DoctorLayout>
        <DoctorProfile />
      </DoctorLayout>
    </DoctorProtectedRoute>
  ),
});
