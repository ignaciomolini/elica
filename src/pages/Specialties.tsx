import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { specialtiesApi } from '../services/api';
import type { Specialty } from '../types';
import { useBookingStore } from '../store';
import { usePendingAppointmentStore } from '../store/pendingAppointmentStore';
import { Button } from '../components/ui/Button';
import { SpecialtyIcon } from '../components/ui/SpecialtyIcon';

export function Specialties() {
  const navigate = useNavigate();
  const setSelectedSpecialty = useBookingStore(
    (state) => state.setSelectedSpecialty,
  );
  const { pendingAppointment } = usePendingAppointmentStore();

  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pendingAppointment) {
      navigate({ to: '/verificacion' });
    }
  }, [pendingAppointment, navigate]);

  useEffect(() => {
    specialtiesApi
      .getAll()
      .then(setSpecialties)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (specialtyId: string) => {
    setSelectedSpecialty(specialtyId);
    navigate({ to: '/medicos' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Elegí una especialidad
        </h1>
        <p className="text-gray-600 max-w-2xl">
          Seleccioná la especialidad que necesitás para ver los médicos
          disponibles.
        </p>
      </div>

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

      {!loading && !error && specialties.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">
            No hay especialidades disponibles en este momento.
          </p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialties.map((specialty) => (
            <button
              key={specialty.id}
              onClick={() => handleSelect(specialty.id)}
              className="text-left bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-300 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 cursor-pointer"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <SpecialtyIcon name={specialty.icon} className="w-6 h-6 text-primary-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {specialty.name}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {specialty.description}
              </p>
              <Button variant="outline" size="sm">
                Seleccionar
              </Button>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
