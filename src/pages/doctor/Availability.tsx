import { useState, useEffect } from 'react';
import type { DoctorScheduleInput } from '../../types';
import { doctorPanelApi } from '../../services/api';

const DEFAULT_SCHEDULES: DoctorScheduleInput[] = [
  { dayOfWeek: 0, startTime: '09:00', endTime: '18:00', interval: 30, enabled: false },
  { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', interval: 30, enabled: true },
  { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', interval: 30, enabled: true },
  { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', interval: 30, enabled: true },
  { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', interval: 30, enabled: true },
  { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', interval: 30, enabled: true },
  { dayOfWeek: 6, startTime: '09:00', endTime: '13:00', interval: 30, enabled: false },
];

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function DoctorAvailability() {
  const [schedules, setSchedules] = useState<DoctorScheduleInput[]>(DEFAULT_SCHEDULES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    doctorPanelApi
      .getSchedule()
      .then((data) => {
        if (data.length > 0) {
          setSchedules(
            data.map((s) => ({
              dayOfWeek: s.dayOfWeek,
              startTime: s.startTime,
              endTime: s.endTime,
              interval: s.interval,
              enabled: s.enabled,
            })),
          );
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      await doctorPanelApi.updateSchedule(schedules);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const updateDay = (
    dayOfWeek: number,
    field: keyof DoctorScheduleInput,
    value: string | number | boolean,
  ) => {
    setSchedules((prev) =>
      prev.map((s) => (s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s)),
    );
  };

  if (loading) {
    return <p className="text-gray-500">Cargando configuración...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración de Horarios</h1>
      <p className="text-gray-600 mb-8">
        Configurá los días y horarios que atendés. El sistema generará automáticamente los turnos
        disponibles para los próximos 30 días.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 font-medium underline">
            Cerrar
          </button>
        </div>
      )}

      <div className="space-y-4">
        {schedules.map((schedule) => (
          <div key={schedule.dayOfWeek} className="bg-white p-4 rounded-lg shadow">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 min-w-[120px]">
                <input
                  type="checkbox"
                  checked={schedule.enabled}
                  onChange={(e) => updateDay(schedule.dayOfWeek, 'enabled', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="font-medium">{DAY_NAMES[schedule.dayOfWeek]}</span>
              </label>

              {schedule.enabled && (
                <>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Desde:</label>
                    <input
                      type="time"
                      value={schedule.startTime}
                      onChange={(e) => updateDay(schedule.dayOfWeek, 'startTime', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Hasta:</label>
                    <input
                      type="time"
                      value={schedule.endTime}
                      onChange={(e) => updateDay(schedule.dayOfWeek, 'endTime', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Intervalo:</label>
                    <select
                      value={schedule.interval}
                      onChange={(e) =>
                        updateDay(schedule.dayOfWeek, 'interval', Number(e.target.value))
                      }
                      className="border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                      <option value={15}>15 min</option>
                      <option value={30}>30 min</option>
                      <option value={60}>60 min</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {saving ? 'Guardando...' : 'Guardar y generar turnos'}
        </button>

        {success && <span className="text-green-600 font-medium">✓ Configuración guardada y turnos generados</span>}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Información importante</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Los turnos se generan automáticamente para los próximos 30 días</li>
          <li>• Al guardar, se eliminarán los turnos futuros sin reservas y se regenerarán con la nueva configuración</li>
          <li>• Los turnos ya reservados no se verán afectados</li>
          <li>• Cuando un paciente cancela un turno, este se libera automáticamente</li>
        </ul>
      </div>
    </div>
  );
}
