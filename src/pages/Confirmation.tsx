import { Link } from '@tanstack/react-router';
import { useBookingStore } from '../store';
import { Button } from '../components/ui/Button';

export function Confirmation() {
  const appointment = useBookingStore((s) => s.appointment);
  const resetBooking = useBookingStore((s) => s.resetBooking);

  if (!appointment) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-center">
        <p className="text-gray-500 text-lg mb-6">
          No hay ninguna reserva registrada.
        </p>
        <Link to="/">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const statusLabel: Record<string, string> = {
    CONFIRMED: 'Confirmado',
    PENDING: 'Pendiente',
    CANCELLED: 'Cancelado',
  };

  const statusColor: Record<string, string> = {
    CONFIRMED: 'bg-accent-100 text-accent-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  const handleNewBooking = () => {
    resetBooking();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-accent-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Turno {appointment.verified ? 'confirmado' : 'registrado'}
        </h1>
        <p className="text-gray-600">
          Tu reserva fue registrada con éxito.
          {appointment.patient?.email &&
            ` Recibirás un email de confirmación en ${appointment.patient.email}.`}
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Detalle de la reserva
        </h2>

        <dl className="space-y-4">
          {appointment.patient && (
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-gray-100">
              <dt className="text-sm font-medium text-gray-500">Paciente</dt>
              <dd className="text-sm text-gray-900 sm:text-right">
                {appointment.patient.name}
              </dd>
            </div>
          )}

          {appointment.doctor && (
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-gray-100">
              <dt className="text-sm font-medium text-gray-500">Médico</dt>
              <dd className="text-sm text-gray-900 sm:text-right">
                {appointment.doctor.name}
              </dd>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-gray-100">
            <dt className="text-sm font-medium text-gray-500">Fecha</dt>
            <dd className="text-sm text-gray-900 sm:text-right">
              {formatDate(appointment.date)}
            </dd>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-gray-100">
            <dt className="text-sm font-medium text-gray-500">Horario</dt>
            <dd className="text-sm text-gray-900 sm:text-right">
              {appointment.startTime} - {appointment.endTime}
            </dd>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3">
            <dt className="text-sm font-medium text-gray-500">Estado</dt>
            <dd className="text-sm sm:text-right">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor[appointment.status] || 'bg-gray-100 text-gray-800'}`}
              >
                {statusLabel[appointment.status] || appointment.status}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
        <Link to="/" onClick={handleNewBooking}>
          <Button variant="outline">Hacer otra reserva</Button>
        </Link>
        <Link to="/">
          <Button variant="primary">Volver al inicio</Button>
        </Link>
      </div>
    </div>
  );
}
