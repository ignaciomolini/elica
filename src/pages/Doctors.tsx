import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { doctorsApi, specialtiesApi } from '../services/api';
import type { Doctor, Specialty } from '../types';
import { useBookingStore } from '../store';
import { usePendingAppointmentStore } from '../store/pendingAppointmentStore';
import { Button } from '../components/ui/Button';

export function Doctors() {
  const navigate = useNavigate();
  const selectedSpecialty = useBookingStore((s) => s.selectedSpecialty);
  const setSelectedSpecialty = useBookingStore((s) => s.setSelectedSpecialty);
  const setSelectedDoctor = useBookingStore((s) => s.setSelectedDoctor);
  const { pendingAppointment } = usePendingAppointmentStore();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialty, setSpecialty] = useState<Specialty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pendingAppointment) {
      navigate({ to: '/verificacion' });
    }
  }, [pendingAppointment, navigate]);

  const handleClearFilter = () => {
    setSelectedSpecialty(null);
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    const loadDoctors = async () => {
      try {
        const [doctorsData, specialtyData] = await Promise.all([
          doctorsApi.getAll(selectedSpecialty ?? undefined),
          selectedSpecialty ? specialtiesApi.getById(selectedSpecialty) : Promise.resolve(null),
        ]);
        setDoctors(doctorsData);
        setSpecialty(specialtyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar médicos');
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, [selectedSpecialty]);

  const handleSelect = (doctorId: string) => {
    setSelectedDoctor(doctorId);
    navigate({ to: '/reservar' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="mb-10">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {specialty
              ? `Médicos de ${specialty.name}`
              : 'Nuestros médicos'}
          </h1>
          {selectedSpecialty && (
            <button
              onClick={handleClearFilter}
              className="shrink-0 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
            >
              Ver todos los médicos
            </button>
          )}
        </div>
        <p className="text-gray-600 max-w-2xl">
          {specialty
            ? `Profesionales especializados en ${specialty.name.toLowerCase()} disponibles para atender.`
            : 'Seleccioná un médico para reservar tu turno.'}
        </p>
      </div>

      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">Cargando médicos...</p>
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

      {!loading && !error && doctors.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">
            No hay médicos disponibles para esta especialidad.
          </p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {doctors.map((doctor) => (
            <article
              key={doctor.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start gap-4">
                <img
                  src={doctor.avatar}
                  alt={`Foto de ${doctor.name}`}
                  className="w-16 h-16 rounded-full bg-gray-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    {doctor.name}
                  </h2>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {doctor.specialties.map((spec) => (
                      <span
                        key={spec.id}
                        className="inline-block px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full"
                      >
                        {spec.name}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {doctor.bio}
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSelect(doctor.id)}
                  >
                    Reservar turno
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
