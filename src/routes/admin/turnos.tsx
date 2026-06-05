import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '../../components/admin/ProtectedRoute';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminAppointments } from '../../pages/admin/Appointments';

export const Route = createFileRoute('/admin/turnos')({
  component: () => (
    <ProtectedRoute>
      <AdminLayout>
        <AdminAppointments />
      </AdminLayout>
    </ProtectedRoute>
  ),
});
