import { useState } from 'react';
import { appointmentsApi, doctorsApi } from '../services/api';
import type { Appointment, TimeSlot } from '../types';

type Step = 'form' | 'list' | 'cancel-code' | 'reschedule-code' | 'reschedule-slot';

interface ActionState {
  appointmentId: string;
  email: string;
  dni: string;
  step: Step;
  doctorId?: string;
}

export function MyAppointments() {
  const [email, setEmail] = useState('');
  const [dni, setDni] = useState('');
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Action flow state
  const [action, setAction] = useState<ActionState | null>(null);
  const [code, setCode] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  // Reschedule slot picker
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');

  const [processing, setProcessing] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await appointmentsApi.getByPatient(email, dni);
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar turnos');
      setAppointments(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCode = async (appointment: Appointment, nextStep: Step) => {
    setSendingCode(true);
    setError(null);
    setCode('');
    setCodeSent(false);

    try {
      await appointmentsApi.requestActionCode(appointment.id, email, dni);
      setCodeSent(true);
      setAction({
        appointmentId: appointment.id,
        email,
        dni,
        step: nextStep,
        doctorId: appointment.doctorId,
      });

      // If reschedule, pre-load slots
      if (nextStep === 'reschedule-slot') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];
        setRescheduleDate(dateStr);
        loadSlots(appointment.doctorId, dateStr);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el código');
    } finally {
      setSendingCode(false);
    }
  };

  const loadSlots = async (doctorId: string, date: string) => {
    setLoadingSlots(true);
    try {
      const allSlots = await doctorsApi.getSlots(doctorId, date);
      setSlots(allSlots.filter((s) => s.available));
      setSelectedSlot('');
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleRescheduleDateChange = (date: string) => {
    setRescheduleDate(date);
    if (action?.doctorId) {
      loadSlots(action.doctorId, date);
    }
  };

  const handleCancelConfirm = async () => {
    if (!action) return;
    setProcessing(true);
    setError(null);

    try {
      await appointmentsApi.cancelWithCode(action.appointmentId, email, dni, code);
      // Refresh appointments
      const data = await appointmentsApi.getByPatient(email, dni);
      setAppointments(data);
      setAction(null);
      setCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar el turno');
    } finally {
      setProcessing(false);
    }
  };

  const handleRescheduleConfirm = async () => {
    if (!action || !selectedSlot) return;
    setProcessing(true);
    setError(null);

    try {
      await appointmentsApi.reschedule(action.appointmentId, email, dni, code, selectedSlot);
      const data = await appointmentsApi.getByPatient(email, dni);
      setAppointments(data);
      setAction(null);
      setCode('');
      setSelectedSlot('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al modificar el turno');
    } finally {
      setProcessing(false);
    }
  };

  const closeAction = () => {
    setAction(null);
    setCode('');
    setCodeSent(false);
    setSelectedSlot('');
    setSlots([]);
  };

  if (!appointments) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Mis turnos</h1>
        <p className="text-gray-600 mb-8 text-center">
          Ingrese su correo y DNI para consultar sus turnos
        </p>

        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="correo@ejemplo.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
            <input
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              required
              placeholder="12345678"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Buscando...' : 'Consultar turnos'}
          </button>
        </form>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'PENDING' || a.status === 'CONFIRMED'
  );
  const pastAppointments = appointments.filter(
    (a) => a.status === 'CANCELLED'
  );

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const formatTime = (time: string) => {
    const [h, m] = time.split(':');
    return `${h}:${m}`;
  };

  const statusLabel = (status: string, verified: boolean) => {
    if (status === 'PENDING' && !verified) return { text: 'Pendiente de verificación', color: 'bg-yellow-100 text-yellow-800' };
    if (status === 'CONFIRMED') return { text: 'Confirmado', color: 'bg-green-100 text-green-800' };
    if (status === 'CANCELLED') return { text: 'Cancelado', color: 'bg-red-100 text-red-800' };
    return { text: status, color: 'bg-gray-100 text-gray-800' };
  };

  const avatarSrc = (avatar?: string) => {
    if (!avatar) return '';
    return avatar.startsWith('http') ? avatar : `http://localhost:3001${avatar}`;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mis turnos</h1>
        <button
          onClick={() => { setAppointments(null); setError(null); }}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Buscar otro paciente
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Turnos de <strong>{email}</strong>
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {/* Upcoming appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Próximos turnos</h2>
          <div className="space-y-3">
            {upcomingAppointments.map((appt) => {
              const status = statusLabel(appt.status, appt.verified);
              return (
                <div key={appt.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-start gap-3">
                    {appt.doctor?.avatar && (
                      <img
                        src={avatarSrc(appt.doctor.avatar)}
                        alt={appt.doctor.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{appt.doctor?.name}</h3>
                          {appt.doctor?.specialties?.[0] && (
                            <p className="text-sm text-gray-500">{appt.doctor.specialties[0].name}</p>
                          )}
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>{formatDate(appt.date)}</p>
                        <p className="text-primary-600 font-medium">{formatTime(appt.startTime)} - {formatTime(appt.endTime)}</p>
                      </div>
                      <div className="mt-3 flex gap-2">
                        {(appt.status === 'PENDING' || appt.status === 'CONFIRMED') && (
                          <>
                            <button
                              onClick={() => handleRequestCode(appt, 'cancel-code')}
                              disabled={sendingCode && action?.appointmentId === appt.id}
                              className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleRequestCode(appt, 'reschedule-slot')}
                              disabled={sendingCode && action?.appointmentId === appt.id}
                              className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                              Modificar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past appointments */}
      {pastAppointments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Historial</h2>
          <div className="space-y-3">
            {pastAppointments.map((appt) => {
              const status = statusLabel(appt.status, appt.verified);
              return (
                <div key={appt.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 opacity-70">
                  <div className="flex items-start gap-3">
                    {appt.doctor?.avatar && (
                      <img
                        src={avatarSrc(appt.doctor.avatar)}
                        alt={appt.doctor.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{appt.doctor?.name}</h3>
                          {appt.doctor?.specialties?.[0] && (
                            <p className="text-sm text-gray-500">{appt.doctor.specialties[0].name}</p>
                          )}
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>{formatDate(appt.date)}</p>
                        <p className="text-primary-600 font-medium">{formatTime(appt.startTime)} - {formatTime(appt.endTime)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {appointments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No se encontraron turnos para este paciente
        </div>
      )}

      {/* Cancel code dialog */}
      {action?.step === 'cancel-code' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Cancelar turno</h2>
            {!codeSent ? (
              <p className="text-gray-600 text-sm">Enviando código...</p>
            ) : (
              <>
                <p className="text-gray-600 text-sm mb-4">
                  Ingrese el código de 6 dígitos que enviamos a su correo
                </p>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  autoFocus
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={closeAction}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Volver
                  </button>
                  <button
                    onClick={handleCancelConfirm}
                    disabled={code.length !== 6 || processing}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {processing ? 'Cancelando...' : 'Confirmar'}
                  </button>
                </div>
                <button
                  onClick={() => handleRequestCode(
                    appointments.find(a => a.id === action.appointmentId)!,
                    'cancel-code'
                  )}
                  disabled={sendingCode}
                  className="mt-3 w-full text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                >
                  Reenviar código
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Reschedule dialog */}
      {action?.step === 'reschedule-slot' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Modificar turno</h2>

            {!codeSent ? (
              <p className="text-gray-600 text-sm">Enviando código...</p>
            ) : (
              <>
                {/* Code input */}
                <div className="mb-4">
                  <p className="text-gray-600 text-sm mb-2">
                    Ingrese el código de 6 dígitos que enviamos a su correo
                  </p>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    autoFocus
                  />
                </div>

                {/* Date picker */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nueva fecha</label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => handleRescheduleDateChange(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                {/* Slot picker */}
                {loadingSlots ? (
                  <p className="text-sm text-gray-500 text-center py-4">Cargando horarios...</p>
                ) : slots.length > 0 ? (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nuevo horario</label>
                    <div className="grid grid-cols-3 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot.id)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                            selectedSlot === slot.id
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                          }`}
                        >
                          {slot.startTime.slice(0, 5)}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No hay horarios disponibles para esta fecha</p>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={closeAction}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Volver
                  </button>
                  <button
                    onClick={handleRescheduleConfirm}
                    disabled={code.length !== 6 || !selectedSlot || processing}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {processing ? 'Modificando...' : 'Confirmar'}
                  </button>
                </div>

                <button
                  onClick={() => handleRequestCode(
                    appointments.find(a => a.id === action.appointmentId)!,
                    'reschedule-slot'
                  )}
                  disabled={sendingCode}
                  className="mt-3 w-full text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                >
                  Reenviar código
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
