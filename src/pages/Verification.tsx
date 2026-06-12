import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useBookingStore } from '../store';
import { usePendingAppointmentStore } from '../store/pendingAppointmentStore';
import { appointmentsApi } from '../services/api';
import { Button } from '../components/ui/Button';

export function Verification() {
  const { appointment, verifyAppointment, isLoading, error, setError, recoverPending } =
    useBookingStore();
  const { pendingAppointment, checkPending, clearPending } = usePendingAppointmentStore();
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [recovering, setRecovering] = useState(true);
  const navigate = useNavigate();

  // Try to recover pending appointment from cookie or localStorage on mount
  useEffect(() => {
    const recoverAppointment = async () => {
      // If we already have an appointment in booking store, use it
      if (appointment) {
        setRecovering(false);
        return;
      }

      // If we have a pending appointment from token cookie, use it
      if (pendingAppointment) {
        useBookingStore.getState().setAppointment(pendingAppointment);
        setRecovering(false);
        return;
      }

      // Try to recover from cookie
      await checkPending();
      const result = await appointmentsApi.getPendingByToken();
      if (result.appointment) {
        useBookingStore.getState().setAppointment(result.appointment);
        setRecovering(false);
        return;
      }

      // Fallback: try localStorage
      const stored = localStorage.getItem('pendingAppointment');
      if (!stored) {
        setRecovering(false);
        return;
      }

      try {
        const { dni } = JSON.parse(stored);
        const found = await recoverPending(dni);
        if (!found) {
          localStorage.removeItem('pendingAppointment');
        }
      } catch (err) {
        console.error('Error recovering appointment:', err);
        localStorage.removeItem('pendingAppointment');
      } finally {
        setRecovering(false);
      }
    };

    recoverAppointment();
  }, [appointment, pendingAppointment, recoverPending, checkPending]);

  // Countdown timer
  useEffect(() => {
    if (!appointment?.expiresAt) return;

    const updateTimer = () => {
      const expiresAt = new Date(appointment.expiresAt!).getTime();
      const now = Date.now();
      const left = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeLeft(left);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [appointment?.expiresAt]);

  // Show loading while trying to recover
  if (recovering) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-10 sm:py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Recuperando turno pendiente...</p>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-10 sm:py-16 text-center">
        <p className="text-gray-500 text-lg mb-6">
          No hay ninguna reserva pendiente de verificación.
        </p>
        <Button onClick={() => navigate({ to: '/' })}>Volver al inicio</Button>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    try {
      await verifyAppointment(code);
      localStorage.removeItem('pendingAppointment');
      clearPending();
      navigate({ to: '/confirmacion' });
    } catch {
      // Error handled by store
    }
  };

  const handleCodeChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setCode(cleaned);
    setError(null);
  };

  const handleCancel = async () => {
    if (!appointment) return;

    const dni = appointment.patient?.dni;

    if (!dni) return;

    setCancelling(true);
    try {
      await appointmentsApi.cancel(appointment.id, dni);
      localStorage.removeItem('pendingAppointment');
      useBookingStore.getState().resetBooking();
      clearPending();
      navigate({ to: '/' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al anular el turno');
    } finally {
      setCancelling(false);
    }
  };

  const handleResendCode = async () => {
    if (!appointment) return;

    const dni = appointment.patient?.dni;

    if (!dni) {
      setResendMessage('No se puede reenviar el código. Por favor, reserve nuevamente.');
      return;
    }

    setResending(true);
    setResendMessage(null);
    try {
      await appointmentsApi.resendCode(appointment.id, dni);
      // Refresh appointment to get new expiresAt
      const result = await appointmentsApi.getPending(dni);
      if (result.appointment) {
        useBookingStore.getState().setAppointment(result.appointment);
      }
      setResendMessage('Código reenviado correctamente');
    } catch (err) {
      setResendMessage(err instanceof Error ? err.message : 'Error al reenviar código');
    } finally {
      setResending(false);
    }
  };

  const isExpired = timeLeft <= 0;

  if (isExpired) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-10 sm:py-16 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Turno expirado</h1>
        <p className="text-gray-600 mb-6">
          El tiempo de verificación ha vencido. Por favor, reservá nuevamente.
        </p>
        <Button onClick={() => {
          localStorage.removeItem('pendingAppointment');
          useBookingStore.getState().resetBooking();
          clearPending();
          navigate({ to: '/' });
        }}>
          Volver al inicio
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-primary-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Verificar turno
        </h1>
        <p className="text-gray-600">
          Enviamos un código de verificación a{' '}
          <span className="font-medium">{appointment.patient?.email}</span>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          (Mock: el código se muestra en la consola del backend)
        </p>
      </div>

      {/* Appointment Info */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Datos del turno
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Especialidad</span>
            <span className="font-medium text-gray-900">
              {appointment.doctor?.specialties?.map(s => s.name).join(', ') || '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Profesional</span>
            <span className="font-medium text-gray-900">{appointment.doctor?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Fecha</span>
            <span className="font-medium text-gray-900">
              {appointment.date
                ? new Date(appointment.date).toLocaleDateString('es-AR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })
                : '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Horario</span>
            <span className="font-medium text-gray-900">
              {appointment.startTime} - {appointment.endTime}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Paciente</span>
            <span className="font-medium text-gray-900">{appointment.patient?.name}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-5">
        {/* Countdown */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">Tiempo restante</p>
          <p className={`text-2xl font-mono font-bold ${timeLeft <= 60 ? 'text-red-600' : 'text-gray-900'}`}>
            {formatTime(timeLeft)}
          </p>
        </div>

        <div>
          <label
            htmlFor="verification-code"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Código de verificación
          </label>
          <input
            id="verification-code"
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder="000000"
            maxLength={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {resendMessage && (
          <div className={`p-3 rounded-lg border ${
            resendMessage.includes('correctamente')
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            <p className="text-sm">{resendMessage}</p>
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={code.length !== 6 || isLoading}
          onClick={handleVerify}
        >
          {isLoading ? 'Verificando...' : 'Verificar'}
        </Button>

        <button
          type="button"
          onClick={handleResendCode}
          disabled={resending}
          className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resending ? 'Reenviando...' : '¿No recibiste el código? Reenviar'}
        </button>

        <div className="border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full text-sm text-red-500 hover:text-red-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelling ? 'Anulando...' : 'Anular turno'}
          </button>
        </div>
      </div>

      {appointment.verificationCode && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            <span className="font-medium">Código de prueba:</span>{' '}
            {appointment.verificationCode}
          </p>
        </div>
      )}
    </div>
  );
}
