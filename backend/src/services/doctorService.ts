import prisma from "../lib/prisma.js";
import { hashPassword } from "./authService.js";

export async function getDoctors(specialtyId?: string) {
  const where: any = { role: "DOCTOR" };

  if (specialtyId) {
    where.specialties = { some: { id: specialtyId } };
  }

  return prisma.doctor.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      bio: true,
      specialties: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getDoctorById(id: string) {
  const doctor = await prisma.doctor.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      bio: true,
      specialties: { select: { id: true, name: true } },
    },
  });

  if (!doctor) {
    throw new Error("Médico no encontrado");
  }

  return doctor;
}

export async function getDoctorByEmail(email: string) {
  return prisma.doctor.findUnique({ where: { email } });
}

export async function getDoctorSlots(doctorId: string, date: string) {
  const [year, month, day] = date.split('-').map(Number);
  const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
  const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

  return prisma.timeSlot.findMany({
    where: {
      doctorId,
      date: { gte: startOfDay, lte: endOfDay },
    },
    orderBy: { startTime: "asc" },
  });
}

export async function createTimeSlots(
  doctorId: string,
  date: string,
  slots: { startTime: string; endTime: string }[]
) {
  const slotDate = new Date(date);

  const created = [];
  for (const slot of slots) {
    const result = await prisma.timeSlot.create({
      data: {
        doctorId,
        date: slotDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
      },
    });
    created.push(result);
  }

  return created;
}

export async function deleteTimeSlot(slotId: string, doctorId: string) {
  const slot = await prisma.timeSlot.findUnique({ where: { id: slotId } });

  if (!slot || slot.doctorId !== doctorId) {
    throw new Error("Horario no encontrado");
  }

  return prisma.timeSlot.delete({ where: { id: slotId } });
}

export async function createDoctor(data: {
  name: string;
  email: string;
  password: string;
  role?: "ADMIN" | "DOCTOR";
  avatar: string;
  bio: string;
  specialtyIds?: string[];
}) {
  const hashedPwd = await hashPassword(data.password);
  return prisma.doctor.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPwd,
      role: data.role ?? "DOCTOR",
      avatar: data.avatar,
      bio: data.bio,
      specialties: data.specialtyIds?.length
        ? { connect: data.specialtyIds.map((id) => ({ id })) }
        : undefined,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      bio: true,
      specialties: { select: { id: true, name: true } },
    },
  });
}

export async function updateDoctor(
  id: string,
  data: {
    name?: string;
    email?: string;
    password?: string;
    role?: "ADMIN" | "DOCTOR";
    avatar?: string;
    bio?: string;
    specialtyIds?: string[];
  }
) {
  const doctor = await prisma.doctor.findUnique({ where: { id } });
  if (!doctor) {
    throw new Error("Médico no encontrado");
  }

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.avatar !== undefined) updateData.avatar = data.avatar;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.password !== undefined) {
    updateData.password = await hashPassword(data.password);
  }
  if (data.specialtyIds !== undefined) {
    updateData.specialties = {
      set: data.specialtyIds.map((sid) => ({ id: sid })),
    };
  }

  return prisma.doctor.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      bio: true,
      specialties: { select: { id: true, name: true } },
    },
  });
}

export async function deleteDoctor(id: string) {
  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: { appointments: true, timeSlots: true },
  });
  if (!doctor) {
    throw new Error("Médico no encontrado");
  }
  if (doctor.appointments.length > 0 || doctor.timeSlots.length > 0) {
    throw new Error("No se puede eliminar un médico con turnos u horarios existentes");
  }
  return prisma.doctor.delete({ where: { id } });
}

export async function getDoctorAllSlots(doctorId: string, date: string) {
  const [year, month, day] = date.split('-').map(Number);
  const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
  const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

  return prisma.timeSlot.findMany({
    where: {
      doctorId,
      date: { gte: startOfDay, lte: endOfDay },
    },
    orderBy: { startTime: "asc" },
  });
}

export async function getDoctorStats(doctorId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalAppointments, pendingAppointments, confirmedAppointments, todayAppointments] =
    await Promise.all([
      prisma.appointment.count({ where: { doctorId } }),
      prisma.appointment.count({ where: { doctorId, status: "PENDING" } }),
      prisma.appointment.count({ where: { doctorId, status: "CONFIRMED" } }),
      prisma.appointment.count({
        where: { doctorId, date: { gte: today } },
      }),
    ]);

  return {
    totalAppointments,
    pendingAppointments,
    confirmedAppointments,
    todayAppointments,
  };
}

export async function countDoctors() {
  return prisma.doctor.count({ where: { role: "DOCTOR" } });
}
