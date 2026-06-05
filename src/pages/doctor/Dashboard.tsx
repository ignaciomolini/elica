import { useState, useEffect } from 'react';
import { doctorPanelApi } from '../../services/api';
import { StatCard } from '../../components/admin/StatCard';
import { useDoctorAuthStore } from '../../store/doctorAuthStore';
import type { DoctorDashboardStats } from '../../types';

const CalendarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TodayIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
  </svg>
);

export function DoctorDashboard() {
  const { doctor } = useDoctorAuthStore();
  const [stats, setStats] = useState<DoctorDashboardStats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    todayAppointments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    doctorPanelApi
      .getStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando estadisticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Bienvenido, {doctor?.name}
      </h1>
      <p className="text-gray-500 mb-8">Panel de control medico</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Turnos totales"
          value={stats.totalAppointments}
          icon={<CalendarIcon />}
          color="blue"
        />
        <StatCard
          title="Pendientes"
          value={stats.pendingAppointments}
          icon={<ClockIcon />}
          color="yellow"
        />
        <StatCard
          title="Confirmados"
          value={stats.confirmedAppointments}
          icon={<CheckIcon />}
          color="green"
        />
        <StatCard
          title="Hoy"
          value={stats.todayAppointments}
          icon={<TodayIcon />}
          color="red"
        />
      </div>
    </div>
  );
}
