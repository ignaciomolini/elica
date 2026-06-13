import {
  startOfWeek,
  addDays,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from 'date-fns';
import type { DoctorSchedule } from '../../types';

/**
 * Returns the 7 Date objects for the week containing `date`.
 * Week starts on Monday (weekStartsOn: 1).
 */
export function getWeekDays(date: Date): Date[] {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

/**
 * Returns a grid of Dates for the month containing `date`.
 * Padded to fill complete weeks (Mon–Sun) for a 6-row grid.
 */
export function getMonthGrid(date: Date): Date[][] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  // Align start to the preceding Monday
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  // Align end: if monthEnd is Sunday, gridEnd = monthEnd; otherwise extend to next Sunday
  const actualGridEnd = getDay(monthEnd) === 0
    ? monthEnd
    : addDays(startOfWeek(monthEnd, { weekStartsOn: 1 }), 6);

  const allDays = eachDayOfInterval({ start: gridStart, end: actualGridEnd });
  const weeks: Date[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }
  return weeks;
}

/**
 * Returns an array of hour strings representing the time range
 * from the given start time to end time (inclusive of start, exclusive of end).
 *
 * Falls back to '08:00'–'20:00' if no schedules are provided.
 *
 * @param schedules - DoctorSchedule entries for the relevant period
 * @returns Array of 'HH:mm' strings
 */
export function getHoursRange(schedules: DoctorSchedule[]): string[] {
  if (schedules.length === 0) {
    return defaultHoursRange();
  }

  const enabledSchedules = schedules.filter((s) => s.enabled);
  if (enabledSchedules.length === 0) {
    return defaultHoursRange();
  }

  // Find the earliest start and latest end across enabled schedules
  let minHour = 24;
  let minMin = 0;
  let maxHour = 0;
  let maxMin = 0;

  for (const schedule of enabledSchedules) {
    const [sH, sM] = schedule.startTime.split(':').map(Number);
    const [eH, eM] = schedule.endTime.split(':').map(Number);
    if (sH < minHour || (sH === minHour && sM < minMin)) {
      minHour = sH;
      minMin = sM;
    }
    if (eH > maxHour || (eH === maxHour && eM > maxMin)) {
      maxHour = eH;
      maxMin = eM;
    }
  }

  const hours: string[] = [];
  let currentHour = minHour;
  while (currentHour < maxHour) {
    hours.push(`${String(currentHour).padStart(2, '0')}:00`);
    currentHour++;
  }
  return hours;
}

function defaultHoursRange(): string[] {
  const hours: string[] = [];
  for (let h = 8; h < 20; h++) {
    hours.push(`${String(h).padStart(2, '0')}:00`);
  }
  return hours;
}

/**
 * Creates a unique key for a day+time slot, used as a map key
 * or React key for appointment lookup.
 *
 * Format: 'YYYY-MM-DD_HH:MM'
 */
export function formatSlotKey(date: Date, time: string): string {
  return `${format(date, 'yyyy-MM-dd')}_${time}`;
}

/**
 * Finds the DoctorSchedule for a specific day of week.
 * Returns undefined if no schedule exists for that day.
 */
export function getScheduleForDay(
  schedules: DoctorSchedule[],
  dayOfWeek: number,
): DoctorSchedule | undefined {
  return schedules.find((s) => s.dayOfWeek === dayOfWeek && s.enabled);
}

/**
 * Parses 'HH:mm' into hours and minutes.
 */
export function parseTime(time: string): { hours: number; minutes: number } {
  const [h, m] = time.split(':').map(Number);
  return { hours: h, minutes: m };
}