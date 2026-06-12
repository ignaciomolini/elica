import { useEffect, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useBookingStore } from '../../store';
import { usePendingAppointmentStore } from '../../store/pendingAppointmentStore';
import { Button } from '../ui/Button';

export function Header() {
  const navigate = useNavigate();
  const setSelectedSpecialty = useBookingStore((s) => s.setSelectedSpecialty);
  const { pendingAppointment, checkPending } = usePendingAppointmentStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Elica" className="h-12 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
            Inicio
          </Link>
          <a href="/especialidades" onClick={handleBookingClick} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
            Especialidades
          </a>
          <a href="/medicos" onClick={handleMedicosClick} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
            Médicos
          </a>
          <Link to="/mis-turnos" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
            Mis turnos
          </Link>
        </nav>

        <div className="hidden md:block">
          {pendingAppointment ? (
            <a href="/verificacion" onClick={handleBookingClick}>
              <Button variant="secondary" size="sm">
                Confirmar turno pendiente
              </Button>
            </a>
          ) : (
            <a href="/especialidades" onClick={handleBookingClick}>
              <Button variant="secondary" size="sm">
                Reservar turno
              </Button>
            </a>
          )}
        </div>

        <button
          type="button"
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-border bg-background px-4 py-4 flex flex-col gap-3">
          <Link to="/" onClick={closeMobile} className="text-muted-foreground hover:text-foreground transition-colors text-sm py-1">
            Inicio
          </Link>
          <a href="/especialidades" onClick={(e) => { handleBookingClick(e); closeMobile(); }} className="text-muted-foreground hover:text-foreground transition-colors text-sm py-1">
            Especialidades
          </a>
          <a href="/medicos" onClick={(e) => { handleMedicosClick(e); closeMobile(); }} className="text-muted-foreground hover:text-foreground transition-colors text-sm py-1">
            Médicos
          </a>
          <Link to="/mis-turnos" onClick={closeMobile} className="text-muted-foreground hover:text-foreground transition-colors text-sm py-1">
            Mis turnos
          </Link>
          <div className="pt-2">
            {pendingAppointment ? (
              <a href="/verificacion" onClick={(e) => { handleBookingClick(e); closeMobile(); }}>
                <Button variant="secondary" size="sm" className="w-full">
                  Confirmar turno pendiente
                </Button>
              </a>
            ) : (
              <a href="/especialidades" onClick={(e) => { handleBookingClick(e); closeMobile(); }}>
                <Button variant="secondary" size="sm" className="w-full">
                  Reservar turno
                </Button>
              </a>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
