import { createFileRoute } from '@tanstack/react-router';
import { AdminLogin } from '../../pages/admin/Login';

export const Route = createFileRoute('/admin/login')({
  component: AdminLogin,
});
