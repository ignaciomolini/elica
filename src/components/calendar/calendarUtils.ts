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
 * Normalizes a time string to 'HH:mm'.
 * Handles both 'HH:mm' and 'HH:mm:ss' formats.
 */
export function normalizeTime(time: string): string {
  return time.slice(0, 5);
}

/**
 * Returns an array of time slot strings representing the time range
 * from the given start time to end time (inclusive of start, exclusive of end),
 * respecting each schedule's interval (in minutes).
 *
 * Falls back to '08:00'–'20:00' with a 60-minute interval if no schedules are provided.
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

  // Find the earliest start, latest end, and smallest interval across enabled schedules
  let minMinutes = Infinity;
  let maxMinutes = 0;
  let intervalMinutes = Infinity;

  for (const schedule of enabledSchedules) {
    const [sH, sM] = schedule.startTime.split(':').map(Number);
    const [eH, eM] = schedule.endTime.split(':').map(Number);
    const start = sH * 60 + sM;
    const end = eH * 60 + eM;

    if (start < minMinutes) minMinutes = start;
    if (end > maxMinutes) maxMinutes = end;
    if (schedule.interval > 0 && schedule.interval < intervalMinutes) {
      intervalMinutes = schedule.interval;
    }
  }

  const interval = intervalMinutes === Infinity ? 60 : intervalMinutes;

  const slots: string[] = [];
  for (let minutes = minMinutes; minutes < maxMinutes; minutes += interval) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
  return slots;
}

function defaultHoursRange(): string[] {
  const slots: string[] = [];
  for (let minutes = 8 * 60; minutes < 20 * 60; minutes += 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
  return slots;
}

/**
 * Creates a unique key for a day+time slot, used as a map key
 * or React key for appointment lookup.
 *
 * Format: 'YYYY-MM-DD_HH:mm'
 */
export function formatSlotKey(date: Date, time: string): string {
  return `${format(date, 'yyyy-MM-dd')}_${normalizeTime(time)}`;
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