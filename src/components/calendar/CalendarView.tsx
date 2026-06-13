import { useEffect, useMemo } from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  isToday,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { useCalendarStore } from '../../store/calendarStore';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { MonthView } from './MonthView';
import { AppointmentPopup } from './AppointmentPopup';
import type { ViewMode } from '../../store/calendarStore';

const VIEW_LABELS: Record<ViewMode, string> = {
  day: 'Día',
  week: 'Semana',
  month: 'Mes',
};

function getViewRangeLabel(viewMode: ViewMode, currentDate: Date): string {
  switch (viewMode) {
    case 'day':
      return format(currentDate, "d 'de' MMMM 'de' yyyy", { locale: es });
    case 'week': {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(weekStart, "d 'de' MMM", { locale: es })} – ${format(weekEnd, "d 'de' MMM 'de' yyyy", { locale: es })}`;
    }
    case 'month':
      return format(currentDate, 'MMMM yyyy', { locale: es });
  }
}

export function CalendarView() {
  const { viewMode, currentDate, loading, error, setViewMode, navigate, goToToday, fetchAppointments, fetchSchedules } =
    useCalendarStore();

  useEffect(() => {
    fetchAppointments();
    fetchSchedules();
  }, [fetchAppointments, fetchSchedules]);

  const rangeLabel = useMemo(() => getViewRangeLabel(viewMode, currentDate), [viewMode, currentDate]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis turnos</h1>
          <p className="text-gray-500 mt-1 text-sm">{rangeLabel}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Today button */}
          <button
            onClick={goToToday}
            disabled={isToday(currentDate) && viewMode === 'day'}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Ir a hoy"
          >
            Hoy
          </button>

          {/* Navigation */}
          <div className="flex items-center">
            <button
              onClick={() => navigate('prev')}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={`Anterior`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => navigate('next')}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={`Siguiente`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* View mode toggle */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            {(Object.keys(VIEW_LABELS) as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
                aria-label={`Vista por ${VIEW_LABELS[mode].toLowerCase()}`}
                aria-pressed={viewMode === mode}
              >
                {VIEW_LABELS[mode]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="flex items-center justify-center py-4 mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent" />
          <span className="ml-2 text-sm text-gray-500">Cargando turnos...</span>
        </div>
      )}

      {/* Calendar content */}
      <div className="flex-1 overflow-auto bg-white rounded-xl shadow-sm border border-gray-100">
        {viewMode === 'day' && <DayView />}
        {viewMode === 'week' && <WeekView />}
        {viewMode === 'month' && <MonthView />}
      </div>

      {/* Appointment popup (create/edit) */}
      <AppointmentPopup />
    </div>
  );
}