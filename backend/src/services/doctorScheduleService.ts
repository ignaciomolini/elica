import prisma from "../lib/prisma.js";

interface ScheduleInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  interval: number;
  enabled: boolean;
}

export async function getDoctorSchedule(doctorId: string) {
  return prisma.doctorSchedule.findMany({
    where: { doctorId },
    orderBy: { dayOfWeek: "asc" },
  });
}

export async function updateDoctorSchedule(doctorId: string, schedules: ScheduleInput[]) {
  console.log(`[SCHEDULE] Updating schedule for doctor ${doctorId}`);
  console.log(`[SCHEDULE] Schedules to save:`, schedules);
  
  // 1. Clear future available time slots from tomorrow onwards
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  console.log(`[SCHEDULE] Clearing slots from ${tomorrow.toISOString()}`);
  
  const deleted = await prisma.timeSlot.deleteMany({
    where: {
      doctorId,
      date: { gte: tomorrow },
      available: true,
      appointment: null,
    },
  });
  
  console.log(`[SCHEDULE] Deleted ${deleted.count} existing slots`);

  // 2. Upsert schedule configuration
  await prisma.$transaction(
    schedules.map((schedule) =>
      prisma.doctorSchedule.upsert({
        where: {
          doctorId_dayOfWeek: { doctorId, dayOfWeek: schedule.dayOfWeek },
        },
        create: { ...schedule, doctorId },
        update: schedule,
      })
    )
  );
  
  console.log(`[SCHEDULE] Saved ${schedules.length} schedule configurations`);

  // 3. Regenerate time slots for the next 30 days from tomorrow
  await generateTimeSlots(doctorId, 30, tomorrow);
}

export async function generateTimeSlots(
  doctorId: string,
  days: number = 30,
  startDate?: Date
) {
  console.log(`[GENERATE] Starting generation for doctor ${doctorId}, ${days} days from ${startDate?.toISOString() || 'today'}`);
  
  const schedules = await prisma.doctorSchedule.findMany({
    where: { doctorId, enabled: true },
  });

  console.log(`[GENERATE] Found ${schedules.length} enabled schedules:`, schedules.map(s => ({ day: s.dayOfWeek, start: s.startTime, end: s.endTime })));

  if (schedules.length === 0) {
    console.log(`[GENERATE] No enabled schedules, exiting`);
    return;
  }

  const today = startDate ?? new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + days);
  
  console.log(`[GENERATE] Generating from ${today.toISOString()} to ${endDate.toISOString()}`);

  let createdCount = 0;

  for (
    let d = new Date(today);
    d <= endDate;
    d.setDate(d.getDate() + 1)
  ) {
    const dayOfWeek = d.getDay();
    const schedule = schedules.find((s) => s.dayOfWeek === dayOfWeek);

    if (!schedule) continue;

    const [startHour, startMin] = schedule.startTime.split(":").map(Number);
    const [endHour, endMin] = schedule.endTime.split(":").map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes < endMinutes) {
      const hour = Math.floor(currentMinutes / 60);
      const min = currentMinutes % 60;
      const startTime = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;

      const nextMinutes = currentMinutes + schedule.interval;
      const nextHour = Math.floor(nextMinutes / 60);
      const nextMin = nextMinutes % 60;
      const endTime = `${String(nextHour).padStart(2, "0")}:${String(nextMin).padStart(2, "0")}`;

      // Check if slot already exists for this date+time
      const exists = await prisma.timeSlot.findFirst({
        where: {
          doctorId,
          date: new Date(d),
          startTime,
        },
      });

      if (!exists) {
        await prisma.timeSlot.create({
          data: {
            doctorId,
            date: new Date(d),
            startTime,
            endTime,
            available: true,
          },
        });
        createdCount++;
      }

      currentMinutes = nextMinutes;
    }
  }
  
  console.log(`[GENERATE] Created ${createdCount} new time slots`);
}

export async function clearFutureTimeSlots(doctorId: string, fromDate: Date) {
  return prisma.timeSlot.deleteMany({
    where: {
      doctorId,
      date: { gte: fromDate },
      available: true,
      appointment: null,
    },
  });
}
