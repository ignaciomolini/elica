import { useState, useEffect, useCallback } from 'react';
import type { Appointment } from '../../types';
import { doctorPanelApi } from '../../services/api';

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

export function DoctorAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadAppointments = useCallback(() => {
    setLoading(true);
    doctorPanelApi
      .getAppointments()
      .then(setAppointments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const handleStatusChange = async (id: string, status: 'CONFIRMED' | 'CANCELLED') => {
    setUpdatingId(id);
    try {
      await doctorPanelApi.updateAppointmentStatus(id, status);
      loadAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el turno');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que querés eliminar este turno? Esta acción no se puede deshacer.')) {
      return;
    }
    
    setDeletingId(id);
    try {
      await doctorPanelApi.deleteAppointment(id);
      loadAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el turno');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'all') return true;
    return apt.status.toLowerCase() === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando turnos...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mis turnos</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
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
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Horario
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No hay turnos para mostrar
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => {
                  const statusInfo = statusConfig[apt.status] || statusConfig.PENDING;
                  const isUpdating = updatingId === apt.id;
                  const isDeleting = deletingId === apt.id;
                  return (
                    <tr key={apt.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{apt.patient?.name}</p>
                          <p className="text-sm text-gray-500">{apt.patient?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(apt.date)}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {apt.startTime} - {apt.endTime}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusInfo.classes}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {apt.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(apt.id, 'CONFIRMED')}
                                disabled={isUpdating}
                                className="px-3 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                              >
                                {isUpdating ? '...' : 'Confirmar'}
                              </button>
                              <button
                                onClick={() => handleStatusChange(apt.id, 'CANCELLED')}
                                disabled={isUpdating}
                                className="px-3 py-1 text-xs font-medium bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50"
                              >
                                {isUpdating ? '...' : 'Cancelar'}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(apt.id)}
                            disabled={isDeleting}
                            className="px-3 py-1 text-xs font-medium bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            {isDeleting ? '...' : 'Eliminar'}
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
    </div>
  );
}
