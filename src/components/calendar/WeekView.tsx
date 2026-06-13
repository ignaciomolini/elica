import { useMemo, useRef, Fragment } from 'react';
import { format, getDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Appointment } from '../../types';
import { useCalendarStore } from '../../store/calendarStore';
import { getWeekDays, getHoursRange, formatSlotKey, getScheduleForDay } from './calendarUtils';
import { getStatusCellClasses } from './statusColors';

export function WeekView() {
  const { appointments, currentDate, schedules, openPopup, loading } = useCalendarStore();
  const gridRef = useRef<HTMLDivElement>(null);

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

  /** True when the week has no appointments after loading completes */
  const isEmptyWeek = !loading && appointments.length === 0;

  if (hours.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No hay horarios configurados para esta semana.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {isEmptyWeek && (
        <div className="px-4 py-3 mb-2 bg-primary-50 border border-primary-200 text-primary-700 rounded-lg text-sm text-center">
          No hay turnos para esta semana
        </div>
      )}
      <div ref={gridRef} className="grid grid-cols-[60px_repeat(7,1fr)] min-w-[800px]" role="grid" aria-label="Calendario semanal">
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
        {hours.map((hour, hourIdx) => (
          <Fragment key={hour}>
            {/* Time label */}
            <div
              className="p-2 text-xs text-gray-500 text-right pr-3 border-r border-gray-100"
            >
              {hour}
            </div>

            {/* Day cells */}
            {weekDays.map((day, dayIdx) => {
              const daySchedule = getScheduleForDay(schedules, getDay(day));
              const isDayOff = !daySchedule;
              const slotKey = formatSlotKey(day, hour);
              const appointment = appointmentMap.get(slotKey);
              const isCurrentHour = isToday(day) && hour === format(new Date(), 'HH:00');

              let cellClasses = 'border border-gray-100 p-1 min-h-[44px] transition-colors focus:ring-2 focus:ring-primary-500 focus:outline-none';
              if (!isDayOff) {
                cellClasses += ' cursor-pointer hover:bg-gray-50';
              }
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
                  data-row={hourIdx}
                  data-col={dayIdx}
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
                    // Enter key: activate cell (edit/create)
                    if (e.key === 'Enter' && !isDayOff) {
                      if (appointment) {
                        openPopup('edit', day, hour, appointment);
                      } else {
                        openPopup('create', day, hour);
                      }
                      return;
                    }

                    // Arrow key navigation
                    let dRow = 0;
                    let dCol = 0;
                    switch (e.key) {
                      case 'ArrowRight': dCol = 1; break;
                      case 'ArrowLeft': dCol = -1; break;
                      case 'ArrowDown': dRow = 1; break;
                      case 'ArrowUp': dRow = -1; break;
                      default: return;
                    }
                    e.preventDefault();

                    let nextRow = hourIdx + dRow;
                    let nextCol = dayIdx + dCol;
                    const grid = gridRef.current;
                    if (!grid) return;

                    // Scan for next focusable cell, skipping day-off cells
                    while (nextRow >= 0 && nextRow < hours.length && nextCol >= 0 && nextCol < 7) {
                      const target = grid.querySelector(`[data-row="${nextRow}"][data-col="${nextCol}"]`);
                      if (target instanceof HTMLElement && target.tabIndex >= 0) {
                        target.focus();
                        return;
                      }
                      nextRow += dRow;
                      nextCol += dCol;
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
          </Fragment>
        ))}
      </div>
    </div>
  );
}