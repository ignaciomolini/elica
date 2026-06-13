import { useMemo } from 'react';
import { format, getDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Appointment } from '../../types';
import { useCalendarStore } from '../../store/calendarStore';
import { getWeekDays, getHoursRange, formatSlotKey, getScheduleForDay } from './calendarUtils';
import { getStatusCellClasses } from './statusColors';

export function WeekView() {
  const { appointments, currentDate, schedules, openPopup, loading } = useCalendarStore();

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  // Build a map of appointments by slot key for O(1) lookup
  const appointmentMap = useMemo(() => {
    const map = new Map<string, Appointment>();
    for (const apt of appointments) {
      // An appointment has a date and startTime; map it to every hour it covers
      // For simplicity in the week view, map to the start hour
      const key = formatSlotKey(new Date(apt.date), apt.startTime);
      map.set(key, apt);
    }
    return map;
  }, [appointments]);

  const hours = useMemo(() => {
    const relevantSchedules = weekDays
      .map((day) => getScheduleForDay(schedules, getDay(day)))
      .filter((s): s is NonNullable<typeof s> => s !== undefined);
    return getHoursRange(
      relevantSchedules.length > 0 ? relevantSchedules : schedules,
    );
  }, [weekDays, schedules]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando turnos...</p>
      </div>
    );
  }

  if (hours.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No hay horarios configurados para esta semana.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-[60px_repeat(7,1fr)] min-w-[800px]" role="grid" aria-label="Calendario semanal">
        {/* Header row */}
        <div className="p-2" /> {/* corner cell */}
        {weekDays.map((day) => {
          const daySchedule = getScheduleForDay(schedules, getDay(day));
          const isDayOff = !daySchedule;
          const today = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={`p-2 text-center border-b border-gray-200 ${
                isDayOff ? 'bg-gray-50' : ''
              } ${today ? 'bg-primary-50/30' : ''}`}
            >
              <div className={`text-xs font-semibold uppercase tracking-wider ${
                today ? 'text-primary-600' : 'text-gray-500'
              }`}>
                {format(day, 'EEE', { locale: es })}
              </div>
              <div className={`text-lg font-bold ${
                today ? 'text-primary-600' : 'text-gray-900'
              }`}>
                {format(day, 'd')}
              </div>
            </div>
          );
        })}

        {/* Hour rows */}
        {hours.map((hour) => (
          <>
            {/* Time label */}
            <div
              key={`time-${hour}`}
              className="p-2 text-xs text-gray-500 text-right pr-3 border-r border-gray-100"
            >
              {hour}
            </div>

            {/* Day cells */}
            {weekDays.map((day) => {
              const daySchedule = getScheduleForDay(schedules, getDay(day));
              const isDayOff = !daySchedule;
              const slotKey = formatSlotKey(day, hour);
              const appointment = appointmentMap.get(slotKey);
              const isCurrentHour = isToday(day) && hour === format(new Date(), 'HH:00');

              let cellClasses = 'border border-gray-100 p-1 min-h-[44px] cursor-pointer transition-colors hover:bg-gray-50';

              if (isDayOff) {
                cellClasses = 'border border-gray-100 bg-gray-50/50 min-h-[44px]';
              } else if (isCurrentHour) {
                cellClasses += ' bg-primary-50/20';
              }

              return (
                <div
                  key={slotKey}
                  role="gridcell"
                  tabIndex={isDayOff ? -1 : 0}
                  className={cellClasses}
                  onClick={() => {
                    if (!isDayOff) {
                      if (appointment) {
                        openPopup('edit', day, hour, appointment);
                      } else {
                        openPopup('create', day, hour);
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isDayOff) {
                      if (appointment) {
                        openPopup('edit', day, hour, appointment);
                      } else {
                        openPopup('create', day, hour);
                      }
                    }
                  }}
                  aria-label={
                    appointment
                      ? `${appointment.patient?.name ?? 'Sin paciente'}, ${format(day, "d 'de' MMMM", { locale: es })} a las ${hour}`
                      : `Turno disponible, ${format(day, "d 'de' MMMM", { locale: es })} a las ${hour}`
                  }
                >
                  {appointment && (
                    <div
                      className={`rounded px-1 py-0.5 text-xs font-medium border ${getStatusCellClasses(appointment.status)}`}
                    >
                      <div className="truncate">{appointment.patient?.name}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}