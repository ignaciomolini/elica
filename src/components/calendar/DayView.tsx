import { useMemo, useRef } from 'react';
import { format, isToday, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Appointment } from '../../types';
import { useCalendarStore } from '../../store/calendarStore';
import { getHoursRange, formatSlotKey, getScheduleForDay } from './calendarUtils';
import { getStatusCellClasses } from './statusColors';

export function DayView() {
  const { appointments, currentDate, schedules, openPopup, loading } = useCalendarStore();
  const gridRef = useRef<HTMLDivElement>(null);

  const daySchedule = useMemo(
    () => getScheduleForDay(schedules, getDay(currentDate)),
    [schedules, currentDate],
  );

  const hours = useMemo(() => {
    if (daySchedule) {
      return getHoursRange([daySchedule]);
    }
    // Fallback: use all enabled schedules or default range
    return getHoursRange(schedules);
  }, [daySchedule, schedules]);

  // Build appointment map for O(1) lookup
  const appointmentMap = useMemo(() => {
    const map = new Map<string, Appointment>();
    for (const apt of appointments) {
      const key = formatSlotKey(new Date(apt.date), apt.startTime);
      map.set(key, apt);
    }
    return map;
  }, [appointments]);

  const isEmpty = !loading && appointments.length === 0;

  if (hours.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No hay horarios configurados para este día.</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      {isEmpty && (
        <div className="px-4 py-3 mb-2 bg-primary-50 border border-primary-200 text-primary-700 rounded-lg text-sm text-center">
          No hay turnos para este día
        </div>
      )}

      {/* Day header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {format(currentDate, 'EEEE', { locale: es })}
        </div>
        <div className={`text-2xl font-bold ${isToday(currentDate) ? 'text-primary-600' : 'text-gray-900'}`}>
          {format(currentDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
        </div>
      </div>

      {/* Hourly grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-[80px_1fr]"
        role="grid"
        aria-label={`Calendario del día ${format(currentDate, "d 'de' MMMM 'de' yyyy", { locale: es })}`}
      >
        {hours.map((hour, hourIdx) => {
          const slotKey = formatSlotKey(currentDate, hour);
          const appointment = appointmentMap.get(slotKey);
          const isCurrentHour = isToday(currentDate) && hour === format(new Date(), 'HH:mm');

          return (
            <div key={hour} className="contents">
              {/* Time label */}
              <div className="p-3 text-sm text-gray-500 text-right pr-4 border-r border-gray-100">
                {hour}
              </div>

              {/* Cell */}
              <div
                role="gridcell"
                tabIndex={0}
                data-row={hourIdx}
                data-col="0"
                className={`border-b border-gray-100 p-2 min-h-[56px] transition-colors focus:ring-2 focus:ring-primary-500 focus:outline-none cursor-pointer hover:bg-gray-50 ${
                  isCurrentHour ? 'bg-primary-50/20' : ''
                }`}
                onClick={() => {
                  if (appointment) {
                    openPopup('edit', currentDate, hour, appointment);
                  } else {
                    openPopup('create', currentDate, hour);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (appointment) {
                      openPopup('edit', currentDate, hour, appointment);
                    } else {
                      openPopup('create', currentDate, hour);
                    }
                    return;
                  }

                  // Arrow key navigation (up/down only in day view)
                  const rowDelta = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : null;
                  if (rowDelta === null) return;
                  e.preventDefault();

                  let nextRow = hourIdx + rowDelta;
                  const grid = gridRef.current;
                  if (!grid) return;

                  while (nextRow >= 0 && nextRow < hours.length) {
                    const target = grid.querySelector(`[data-row="${nextRow}"][data-col="0"]`);
                    if (target instanceof HTMLElement) {
                      target.focus();
                      return;
                    }
                    nextRow += rowDelta;
                  }
                }}
                aria-label={
                  appointment
                    ? `${appointment.patient?.name ?? 'Sin paciente'}, ${hour}`
                    : `Turno disponible, ${hour}`
                }
              >
                {appointment && (
                  <div
                    className={`rounded px-3 py-1.5 text-sm font-medium border ${getStatusCellClasses(appointment.status)}`}
                  >
                    <div className="font-semibold truncate">
                      {appointment.patient?.name ?? 'Sin paciente'}
                    </div>
                    <div className="text-xs opacity-75">
                      {appointment.startTime} – {appointment.endTime}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}