import { useMemo, useRef } from 'react';
import {
  format,
  isToday,
  isSameMonth,
  startOfWeek,
  addDays,
} from 'date-fns';
import { es } from 'date-fns/locale';
import type { Appointment } from '../../types';
import { useCalendarStore } from '../../store/calendarStore';
import { getMonthGrid, formatSlotKey } from './calendarUtils';
import { getStatusCellClasses } from './statusColors';

export function MonthView() {
  const { appointments, currentDate, openPopup, loading } = useCalendarStore();
  const gridRef = useRef<HTMLDivElement>(null);

  const weeks = useMemo(() => getMonthGrid(currentDate), [currentDate]);

  // Group appointments by date string (YYYY-MM-DD)
  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const apt of appointments) {
      const dateStr = apt.date.split('T')[0]; // handle ISO strings
      const existing = map.get(dateStr);
      if (existing) {
        existing.push(apt);
      } else {
        map.set(dateStr, [apt]);
      }
    }
    return map;
  }, [appointments]);

  const isEmpty = !loading && appointments.length === 0;

  // Day name headers (Mon-Sun)
  const dayHeaders = useMemo(() => {
    const base = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(base, i));
  }, []);

  return (
    <div className="overflow-y-auto">
      {isEmpty && (
        <div className="px-4 py-3 mb-2 bg-primary-50 border border-primary-200 text-primary-700 rounded-lg text-sm text-center">
          No hay turnos para este mes
        </div>
      )}

      {/* Day name headers */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {dayHeaders.map((day, i) => (
          <div
            key={i}
            className="py-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-500"
          >
            {format(day, 'EEE', { locale: es })}
          </div>
        ))}
      </div>

      {/* Month grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-7"
        role="grid"
        aria-label={`Calendario mensual ${format(currentDate, 'MMMM yyyy', { locale: es })}`}
      >
        {weeks.map((week, weekIdx) =>
          week.map((day, dayIdx) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayAppointments = appointmentsByDate.get(dateStr) ?? [];
            const inMonth = isSameMonth(day, currentDate);
            const today = isToday(day);

            return (
              <div
                key={dateStr}
                data-row={weekIdx}
                data-col={dayIdx}
                tabIndex={inMonth ? 0 : -1}
                className={`min-h-[80px] border-b border-r border-gray-100 p-1 transition-colors focus:ring-2 focus:ring-primary-500 focus:outline-none ${
                  !inMonth ? 'bg-gray-50/50' : 'bg-white'
                } ${today ? 'ring-2 ring-inset ring-primary-500' : ''}`}
                role="gridcell"
                aria-label={format(day, "d 'de' MMMM", { locale: es })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && inMonth && dayAppointments.length > 0) {
                    const firstApt = dayAppointments[0];
                    openPopup('edit', day, firstApt.startTime, firstApt);
                    return;
                  }

                  const dRow = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
                  const dCol = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
                  if (dRow === 0 && dCol === 0) return;
                  e.preventDefault();

                  let nextRow = weekIdx + dRow;
                  let nextCol = dayIdx + dCol;
                  const grid = gridRef.current;
                  if (!grid) return;

                  while (nextRow >= 0 && nextRow < weeks.length && nextCol >= 0 && nextCol < 7) {
                    const target = grid.querySelector(`[data-row="${nextRow}"][data-col="${nextCol}"]`);
                    if (target instanceof HTMLElement && target.tabIndex >= 0) {
                      target.focus();
                      return;
                    }
                    nextRow += dRow;
                    nextCol += dCol;
                  }
                }}
              >
                {/* Day number */}
                <div
                  className={`text-xs font-medium mb-1 ${
                    today
                      ? 'bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center'
                      : inMonth
                        ? 'text-gray-700'
                        : 'text-gray-400'
                  }`}
                >
                  {format(day, 'd')}
                </div>

                {/* Appointments list — expands to show ALL */}
                {dayAppointments.length > 0 && (
                  <div className="space-y-0.5">
                    {dayAppointments.map((apt) => {
                      const slotKey = formatSlotKey(day, apt.startTime);
                      return (
                        <button
                          key={slotKey}
                          type="button"
                          className={`w-full text-left rounded px-1 py-0.5 text-[11px] border cursor-pointer transition-colors hover:opacity-80 focus:ring-2 focus:ring-primary-500 focus:outline-none ${getStatusCellClasses(apt.status)}`}
                          onClick={() => openPopup('edit', day, apt.startTime, apt)}
                          aria-label={`${apt.patient?.name ?? 'Sin paciente'}, ${apt.startTime}–${apt.endTime}`}
                        >
                          <div className="truncate font-medium">
                            {apt.patient?.name ?? 'Sin paciente'}
                          </div>
                          <div className="truncate opacity-75">
                            {apt.startTime}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}