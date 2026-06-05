import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '../../components/admin/ProtectedRoute';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminDashboard } from '../../pages/admin/Dashboard';

export const Route = createFileRoute('/admin/')({
  component: () => (
    <ProtectedRoute>
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    </ProtectedRoute>
  ),
});
