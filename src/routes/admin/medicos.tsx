import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '../../components/admin/ProtectedRoute';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminDoctors } from '../../pages/admin/Doctors';

export const Route = createFileRoute('/admin/medicos')({
  component: () => (
    <ProtectedRoute>
      <AdminLayout>
        <AdminDoctors />
      </AdminLayout>
    </ProtectedRoute>
  ),
});
