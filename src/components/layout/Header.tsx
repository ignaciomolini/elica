import { useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useBookingStore } from '../../store';
import { usePendingAppointmentStore } from '../../store/pendingAppointmentStore';

export function Header() {
  const navigate = useNavigate();
  const setSelectedSpecialty = useBookingStore((s) => s.setSelectedSpecialty);
  const { pendingAppointment, checkPending } = usePendingAppointmentStore();

  useEffect(() => {
    checkPending();
  }, [checkPending]);

  const handleMedicosClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (pendingAppointment) {
      navigate({ to: '/verificacion' });
      return;
    }
    setSelectedSpecialty(null);
    navigate({ to: '/medicos' });
  };

  const handleBookingClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (pendingAppointment) {
      navigate({ to: '/verificacion' });
      return;
    }
    navigate({ to: '/especialidades' });
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Elica</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
            >
              Inicio
            </Link>
            <a
              href="/especialidades"
              onClick={handleBookingClick}
              className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors cursor-pointer"
            >
              Especialidades
            </a>
            <a
              href="/medicos"
              onClick={handleMedicosClick}
              className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors cursor-pointer"
            >
              Médicos
            </a>
            <Link
              to="/mis-turnos"
              className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
            >
              Mis turnos
            </Link>
          </nav>

          {pendingAppointment ? (
            <a
              href="/verificacion"
              onClick={handleBookingClick}
              className="hidden sm:inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors cursor-pointer"
            >
              Confirmar turno pendiente
            </a>
          ) : (
            <a
              href="/especialidades"
              onClick={handleBookingClick}
              className="hidden sm:inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors cursor-pointer"
            >
              Reservar turno
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
