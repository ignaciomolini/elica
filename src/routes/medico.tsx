import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/medico')({
  component: () => <Outlet />,
});
