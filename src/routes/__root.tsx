import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router';
import { Layout } from '../components/layout/Layout';

export const Route = createRootRoute({
  component: () => {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');
    const isMedicoPanel = location.pathname.startsWith('/medico/');

    if (isAdmin || isMedicoPanel) return <Outlet />;

    return (
      <Layout>
        <Outlet />
      </Layout>
    );
  },
});
