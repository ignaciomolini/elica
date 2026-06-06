import { useState, useEffect } from 'react';
import type { Appointment, Doctor, TimeSlot } from '../../types';
import { adminApi, doctorsApi } from '../../services/api';

type FilterStatus = 'all' | 'pending' | 'confirmed' | 'cancelled';

const statusConfig: Record<string, { label: string; classes: string }> = {
  PENDING: { label: 'Pendiente', classes: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: 'Confirmado', classes: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelado', classes: 'bg-red-100 text-red-800' },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const filterButtons: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'confirmed', label: 'Confirmados' },
  { value: 'cancelled', label: 'Cancelados' },
];

interface RescheduleModalProps {
  appointment: Appointment;
  onClose: () => void;
  onDone: () => void;
}

function RescheduleModal({ appointment, onClose, onDone }: RescheduleModalProps) {
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSlots = async (d: string) => {
    setLoading(true);
    setSelectedSlot('');
    try {
      const all = await doctorsApi.getSlots(appointment.doctorId, d);
      setSlots(all.filter((s) => s.available));
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (d: string) => {
    setDate(d);
    if (d) loadSlots(d);
  };

  const handleSubmit = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    setError(null);
    try {
      await adminApi.rescheduleAppointment(appointment.id, selectedSlot);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al modificar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Modificar turno</h2>
        <p className="text-sm text-gray-500 mb-4">
          {appointment.patient?.name} — {appointment.doctor?.name}
        </p>

        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nueva fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>

        {loading && !slots.length && (
          <p className="text-sm text-gray-500 text-center py-4">Cargando horarios...</p>
        )}

        {slots.length > 0 && (
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
        )}

        {date && !loading && slots.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-2">No hay horarios disponibles</p>
        )}

        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            Volver
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedSlot || loading}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface NewAppointmentModalProps {
  doctors: Doctor[];
  onClose: () => void;
  onDone: () => void;
}

function NewAppointmentModal({ doctors, onClose, onDone }: NewAppointmentModalProps) {
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dni, setDni] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSlots = async (docId: string, d: string) => {
    setLoading(true);
    setSelectedSlot('');
    try {
      const all = await doctorsApi.getSlots(docId, d);
      setSlots(all.filter((s) => s.available));
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorChange = (id: string) => {
    setDoctorId(id);
    setSelectedSlot('');
    setSlots([]);
    if (id && date) loadSlots(id, date);
  };

  const handleDateChange = (d: string) => {
    setDate(d);
    setSelectedSlot('');
    if (doctorId && d) loadSlots(doctorId, d);
  };

  const handleSubmit = async () => {
    if (!doctorId || !selectedSlot || !name || !email || !phone || !dni) return;
    setLoading(true);
    setError(null);
    try {
      await adminApi.createAppointment({ doctorId, timeSlotId: selectedSlot, patientName: name, patientEmail: email, patientPhone: phone, patientDni: dni });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el turno');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Nuevo turno</h2>

        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Médico</label>
            <select
              value={doctorId}
              onChange={(e) => handleDoctorChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="">Seleccionar médico</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          {loading && !slots.length && (
            <p className="text-sm text-gray-500 text-center">Cargando horarios...</p>
          )}

          {slots.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Horario</label>
              <div className="grid grid-cols-4 gap-2">
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
          )}

          {doctorId && date && !loading && slots.length === 0 && (
            <p className="text-sm text-gray-500 text-center">No hay horarios disponibles</p>
          )}

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Datos del paciente</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
                <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!doctorId || !selectedSlot || !name || !email || !phone || !dni || loading}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear turno'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Modals
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  const loadAppointments = () => {
    setLoading(true);
    adminApi
      .getAllAppointments()
      .then(setAppointments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const loadDoctors = () => {
    adminApi.getDoctors().then(setDoctors).catch(() => {});
  };

  useEffect(() => {
    loadAppointments();
    loadDoctors();
  }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm('¿Estás seguro de cancelar este turno? Se notificará al paciente.')) return;
    setUpdatingId(id);
    try {
      await adminApi.cancelAppointment(id);
      loadAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'all') return true;
    return apt.status.toLowerCase() === filter;
  });

  if (loading && !appointments.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando turnos...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Todos los turnos</h1>
        <button
          onClick={() => setShowNewModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          + Nuevo turno
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {filterButtons.map((btn) => (
          <button
            key={btn.value}
            onClick={() => setFilter(btn.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === btn.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Paciente</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Médico</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Horario</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No hay turnos para mostrar</td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => {
                  const statusInfo = statusConfig[apt.status] || statusConfig.PENDING;
                  const isBusy = updatingId === apt.id;
                  return (
                    <tr key={apt.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{apt.patient?.name}</p>
                        <p className="text-sm text-gray-500">{apt.patient?.email}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{apt.doctor?.name}</td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(apt.date)}</td>
                      <td className="px-6 py-4 text-gray-600">{apt.startTime} - {apt.endTime}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusInfo.classes}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                            <>
                              <button
                                onClick={() => setRescheduleTarget(apt)}
                                disabled={isBusy}
                                className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                              >
                                Modificar
                              </button>
                              <button
                                onClick={() => handleCancel(apt.id)}
                                disabled={isBusy}
                                className="px-3 py-1 text-xs font-medium bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50"
                              >
                                {isBusy ? '...' : 'Cancelar'}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm('¿Eliminar este turno permanentemente?')) {
                                setUpdatingId(apt.id);
                                adminApi.deleteAppointment(apt.id)
                                  .then(loadAppointments)
                                  .catch((err) => setError(err.message))
                                  .finally(() => setUpdatingId(null));
                              }
                            }}
                            disabled={isBusy}
                            className="px-3 py-1 text-xs font-medium bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            {isBusy ? '...' : 'Eliminar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {rescheduleTarget && (
        <RescheduleModal
          appointment={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onDone={() => { setRescheduleTarget(null); loadAppointments(); }}
        />
      )}

      {showNewModal && (
        <NewAppointmentModal
          doctors={doctors}
          onClose={() => setShowNewModal(false)}
          onDone={() => { setShowNewModal(false); loadAppointments(); }}
        />
      )}
    </div>
  );
}
