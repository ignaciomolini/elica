import { createFileRoute } from '@tanstack/react-router';
import { DoctorProtectedRoute } from '../../components/doctor/ProtectedRoute';
import { DoctorLayout } from '../../components/doctor/DoctorLayout';
import { DoctorDashboard } from '../../pages/doctor/Dashboard';

export const Route = createFileRoute('/medico/')({
  component: () => (
    <DoctorProtectedRoute>
      <DoctorLayout>
        <DoctorDashboard />
      </DoctorLayout>
    </DoctorProtectedRoute>
  ),
});
