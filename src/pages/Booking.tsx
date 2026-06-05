import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { doctorsApi } from '../services/api';
import type { Doctor, TimeSlot } from '../types';
import { useBookingStore } from '../store';
import { usePendingAppointmentStore } from '../store/pendingAppointmentStore';
import { Button } from '../components/ui/Button';

export function Booking() {
  const navigate = useNavigate();
  const selectedDoctor = useBookingStore((s) => s.selectedDoctor);
  const selectedDate = useBookingStore((s) => s.selectedDate);
  const selectedTimeSlot = useBookingStore((s) => s.selectedTimeSlot);
  const patientInfo = useBookingStore((s) => s.patientInfo);
  const setSelectedDate = useBookingStore((s) => s.setSelectedDate);
  const setSelectedTimeSlot = useBookingStore((s) => s.setSelectedTimeSlot);
  const setPatientInfo = useBookingStore((s) => s.setPatientInfo);
  const createAppointment = useBookingStore((s) => s.createAppointment);
  const isLoading = useBookingStore((s) => s.isLoading);
  const error = useBookingStore((s) => s.error);
  const { pendingAppointment } = usePendingAppointmentStore();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [step, setStep] = useState<'datetime' | 'patient'>('datetime');
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [enabledDays, setEnabledDays] = useState<number[]>([]);

  // Redirect if there's a pending appointment
  useEffect(() => {
    if (pendingAppointment) {
      navigate({ to: '/verificacion' });
    }
  }, [pendingAppointment, navigate]);

  // Generate next 30 dates filtered by doctor's enabled days
  const availableDates = useMemo(() => {
    if (enabledDays.length === 0) return [];
    
    const dates: string[] = [];
    const today = new Date();
    today.setDate(today.getDate() + 1); // Start from tomorrow
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();
      
      if (enabledDays.includes(dayOfWeek)) {
        const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      dates.push(`${yyyy}-${mm}-${dd}`);
      }
    }
    
    return dates;
  }, [enabledDays]);

  // Load doctor details
  useEffect(() => {
    if (!selectedDoctor) {
      setLoadingDoctor(false);
      return;
    }
    setLoadingDoctor(true);
    doctorsApi
      .getById(selectedDoctor)
      .then(setDoctor)
      .catch(() => setDoctor(null))
      .finally(() => setLoadingDoctor(false));
  }, [selectedDoctor]);

  // Load doctor's schedule to get enabled days
  useEffect(() => {
    if (!selectedDoctor) {
      setEnabledDays([]);
      return;
    }
    
    fetch(`http://localhost:3001/api/doctors/${selectedDoctor}/schedule`)
      .then(res => res.json())
      .then((schedules: any[]) => {
        const enabled = schedules
          .filter(s => s.enabled)
          .map(s => s.dayOfWeek);
        setEnabledDays(enabled);
      })
      .catch(() => setEnabledDays([]));
  }, [selectedDoctor]);

  // Load time slots when date changes
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) {
      setSlots([]);
      return;
    }

    setLoadingSlots(true);
    setSelectedTimeSlot(null);
    doctorsApi
      .getSlots(selectedDoctor, selectedDate)
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDoctor, selectedDate, setSelectedTimeSlot]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('es-AR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const isFormValid =
    patientInfo.name.trim() !== '' &&
    patientInfo.email.trim() !== '' &&
    patientInfo.phone.trim() !== '' &&
    patientInfo.dni.trim().length >= 7;

  const handleConfirm = async () => {
    if (!selectedDoctor || !selectedTimeSlot || !isFormValid) return;

    try {
      await createAppointment();

      // Save to localStorage for recovery if user closes the tab
      const { appointment } = useBookingStore.getState();
      if (appointment && patientInfo) {
        localStorage.setItem(
          'pendingAppointment',
          JSON.stringify({
            appointmentId: appointment.id,
            email: patientInfo.email,
            dni: patientInfo.dni,
          }),
        );
      }

      await usePendingAppointmentStore.getState().checkPending();

      navigate({ to: '/verificacion' });
    } catch {
      // Error is handled by the store
    }
  };

  if (loadingDoctor) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-center">
        <p className="text-gray-500 text-lg">Cargando...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-center">
        <p className="text-gray-500 text-lg">
          No se seleccionó un médico. Por favor, volvé y elegí un médico.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Reservar turno con {doctor.name}
        </h1>
        <p className="text-gray-600">
          Seleccioná la fecha y hora que prefieras para tu consulta.
        </p>
      </div>

      {step === 'datetime' && (
        <div className="space-y-8">
          {/* Date Selection */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              1. Elegí una fecha
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {availableDates.map((date) => (
                <button
                  key={date}
                  onClick={() => {
                    setSelectedDate(date);
                  }}
                  className={`shrink-0 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    selectedDate === date
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-300'
                  }`}   
                >
                  {formatDate(date)}
                </button>
              ))}
            </div>
          </section>

          {/* Time Slot Selection */}
          {selectedDate && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                2. Elegí un horario
              </h2>

              {loadingSlots && (
                <p className="text-gray-500">Cargando horarios disponibles...</p>
              )}

              {!loadingSlots && slots.length === 0 && (
                <p className="text-gray-500">
                  No hay horarios para esta fecha. Elegí otra fecha.
                </p>
              )}

              {!loadingSlots && slots.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {slots.map((slot) =>
                    slot.available ? (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                          selectedTimeSlot?.id === slot.id
                            ? 'bg-primary-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-primary-300'
                        }`}
                      >
                        {slot.startTime}
                      </button>
                    ) : (
                      <div
                        key={slot.id}
                        className="px-3 py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-400 line-through cursor-not-allowed select-none text-center"
                      >
                        {slot.startTime}
                      </div>
                    )
                  )}
                </div>
              )}
            </section>
          )}

          {selectedTimeSlot && (
            <div className="pt-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setStep('patient')}
              >
                Continuar con los datos
              </Button>
            </div>
          )}
        </div>
      )}

      {step === 'patient' && (
        <div className="max-w-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            3. Tus datos de contacto
          </h2>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
            <div>
              <label
                htmlFor="patient-name"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Nombre completo
              </label>
              <input
                id="patient-name"
                type="text"
                value={patientInfo.name}
                onChange={(e) => setPatientInfo({ name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ej: Juan Perez"
              />
            </div>

            <div>
              <label
                htmlFor="patient-email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Correo electrónico
              </label>
              <input
                id="patient-email"
                type="email"
                value={patientInfo.email}
                onChange={(e) => setPatientInfo({ email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ej: juan@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="patient-phone"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Teléfono
              </label>
              <input
                id="patient-phone"
                type="tel"
                value={patientInfo.phone}
                onChange={(e) => setPatientInfo({ phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ej: 11 1234-5678"
              />
            </div>

            <div>
              <label
                htmlFor="patient-dni"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                DNI
              </label>
              <input
                id="patient-dni"
                type="text"
                value={patientInfo.dni}
                onChange={(e) => setPatientInfo({ dni: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ej: 12345678"
                maxLength={10}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep('datetime')}>
                Volver
              </Button>
              <Button
                variant="primary"
                disabled={!isFormValid || isLoading}
                onClick={handleConfirm}
              >
                {isLoading ? 'Reservando...' : 'Confirmar reserva'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
