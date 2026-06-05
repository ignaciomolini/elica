import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { specialtiesApi } from '../services/api';
import { useBookingStore } from '../store';
import type { Specialty } from '../types';
import { Button } from '../components/ui/Button';

export function Home() {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Recovery state
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryDni, setRecoveryDni] = useState('');
  const [recovering, setRecovering] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  const recoverPending = useBookingStore((s) => s.recoverPending);

  useEffect(() => {
    specialtiesApi
      .getAll()
      .then(setSpecialties)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleRecover = async () => {
    if (!recoveryEmail.trim() || !recoveryDni.trim()) {
      setRecoveryError('Email y DNI son requeridos');
      return;
    }

    setRecovering(true);
    setRecoveryError(null);
    try {
      const found = await recoverPending(recoveryEmail.trim(), recoveryDni.trim());

      if (found) {
        localStorage.setItem(
          'pendingAppointment',
          JSON.stringify({
            appointmentId: useBookingStore.getState().appointment?.id,
            email: recoveryEmail.trim(),
            dni: recoveryDni.trim(),
          }),
        );
        navigate({ to: '/verificacion' });
      } else {
        setRecoveryError('No se encontraron turnos pendientes');
      }
    } catch (err) {
      setRecoveryError(err instanceof Error ? err.message : 'Error al recuperar turno');
    } finally {
      setRecovering(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-linear-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Reservá tu turno médico de forma simple
            </h1>
            <p className="text-lg sm:text-xl text-primary-100 mb-8 leading-relaxed">
              Elegí la especialidad, seleccioná tu médico preferido y reservá el
              horario que mejor se adapte a vos. Sin llamadas, sin esperas.
            </p>
            <Link to="/especialidades">
              <Button variant="secondary" size="lg">
                Reservar turno ahora
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Specialties Preview */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">
            Nuestras especialidades
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Contamos con un equipo de profesionales capacitados en diversas
              áreas de la salud para cuidar de vos y tu familia.
          </p>

          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">Cargando especialidades...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {specialties.map((specialty) => (
                  <div
                    key={specialty.id}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all duration-200"
                  >
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                      <svg
                        className="w-6 h-6 text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {specialty.name}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {specialty.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="text-center mt-10">
                <Link to="/especialidades">
                  <Button variant="outline">Ver todas las especialidades</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-accent-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Tu salud es lo primero
          </h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            No esperés más para cuidar de vos. Reservá tu turno en menos de 2
            minutos y recibí confirmación inmediata.
          </p>
          <Link to="/especialidades">
            <Button size="lg">Comenzar reserva</Button>
          </Link>
        </div>
      </section>

      {/* Recovery Section */}
      <section className="py-12 border-t border-gray-100">
        <div className="max-w-md mx-auto px-4 sm:px-6 text-center">
          <button
            type="button"
            onClick={() => {
              setShowRecovery(!showRecovery);
              setRecoveryError(null);
            }}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            ¿Ya reservaste? Continuar verificación
          </button>

          {showRecovery && (
            <div className="mt-4 p-5 bg-white rounded-xl shadow-sm border border-gray-100 text-left space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Recuperar turno pendiente
              </h3>
              <p className="text-sm text-gray-600">
                Ingresá tus datos para continuar con la verificación de tu turno.
              </p>

              <div>
                <label
                  htmlFor="recovery-email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Correo electrónico
                </label>
                <input
                  id="recovery-email"
                  type="email"
                  placeholder="Ej: juan@email.com"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label
                  htmlFor="recovery-dni"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  DNI
                </label>
                <input
                  id="recovery-dni"
                  type="text"
                  placeholder="Ej: 12345678"
                  value={recoveryDni}
                  onChange={(e) => setRecoveryDni(e.target.value)}
                  maxLength={10}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {recoveryError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{recoveryError}</p>
                </div>
              )}

              <Button
                variant="primary"
                className="w-full"
                disabled={recovering}
                onClick={handleRecover}
              >
                {recovering ? 'Buscando...' : 'Recuperar turno'}
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
