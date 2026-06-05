import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '../../components/admin/ProtectedRoute';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminSpecialties } from '../../pages/admin/Specialties';

export const Route = createFileRoute('/admin/especialidades')({
  component: () => (
    <ProtectedRoute>
      <AdminLayout>
        <AdminSpecialties />
      </AdminLayout>
    </ProtectedRoute>
  ),
});
