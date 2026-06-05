import { useEffect, type ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../../store/authStore';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isChecking, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isChecking && !isAuthenticated) {
      navigate({ to: '/admin/login' });
    }
  }, [isChecking, isAuthenticated, navigate]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
