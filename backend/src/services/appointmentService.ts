import prisma from "../lib/prisma.js";
import { generateCode, mockSendCode } from "../utils/verification.js";
import { AppointmentStatus } from "@prisma/client";
import crypto from "crypto";

interface CreateAppointmentInput {
  doctorId: string;
  timeSlotId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientDni: string;
}

export async function createAppointment(input: CreateAppointmentInput) {
  const { doctorId, timeSlotId, patientName, patientEmail, patientPhone, patientDni } = input;

  return prisma.$transaction(async (tx) => {
    // Check slot availability
    const timeSlot = await tx.timeSlot.findUnique({
      where: { id: timeSlotId },
    });

    if (!timeSlot) {
      throw new Error("Horario no encontrado");
    }

    if (timeSlot.doctorId !== doctorId) {
      throw new Error("El horario no pertenece a este médico");
    }

    // Clean up any expired PENDING appointments for this slot
    const existingAppointment = await tx.appointment.findUnique({
      where: { timeSlotId },
    });

    if (existingAppointment) {
      if (existingAppointment.status === "PENDING" && !existingAppointment.verified) {
        // Check if expired
        if (existingAppointment.expiresAt && new Date() > existingAppointment.expiresAt) {
          // Delete expired appointment and free the slot
          await tx.appointment.delete({ where: { id: existingAppointment.id } });
          await tx.timeSlot.update({
            where: { id: timeSlotId },
            data: { available: true },
          });
        } else {
          // Appointment is still valid (not expired)
          throw new Error("El horario ya está reservado");
        }
      } else {
        // Appointment is CONFIRMED or CANCELLED
        throw new Error("El horario ya está reservado");
      }
    }

    // Re-check slot availability after cleanup
    const updatedSlot = await tx.timeSlot.findUnique({
      where: { id: timeSlotId },
    });

    if (!updatedSlot || !updatedSlot.available) {
      throw new Error("El horario ya no está disponible");
    }

    // Find or create patient by email + dni
    let patient = await tx.patient.findFirst({
      where: { email: patientEmail, dni: patientDni },
    });

    if (!patient) {
      patient = await tx.patient.create({
        data: {
          name: patientName,
          email: patientEmail,
          phone: patientPhone,
          dni: patientDni,
        },
      });
    }

    // Generate verification code and token
    const verificationCode = generateCode();
    const verificationToken = crypto.randomUUID();

    // Set expiration to 5 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Create appointment
    const appointment = await tx.appointment.create({
      data: {
        doctorId,
        patientId: patient.id,
        timeSlotId,
        date: timeSlot.date,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        verificationCode,
        verificationToken,
        expiresAt,
      },
      include: {
        doctor: { select: { id: true, name: true, avatar: true, specialties: { select: { id: true, name: true } } } },
        patient: { select: { id: true, name: true, email: true, phone: true, dni: true } },
      },
    });

    // Mark slot as unavailable (will be freed if appointment expires or is cancelled)
    await tx.timeSlot.update({
      where: { id: timeSlotId },
      data: { available: false },
    });

    // Mock send verification code
    mockSendCode(verificationCode, patientPhone);

    return {
      ...appointment,
      verificationCode, // returned in mock mode for testing
      verificationToken,
    };
  });
}

export async function verifyAppointment(appointmentId: string, code: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    throw new Error("Turno no encontrado");
  }

  // Check expiration
  if (appointment.expiresAt && new Date() > appointment.expiresAt) {
    // Free the slot and delete the expired appointment
    await prisma.$transaction([
      prisma.appointment.delete({ where: { id: appointmentId } }),
      prisma.timeSlot.update({
        where: { id: appointment.timeSlotId },
        data: { available: true },
      }),
    ]);
    throw new Error("El turno ha expirado. Por favor, reserve nuevamente.");
  }

  if (appointment.verified) {
    throw new Error("El turno ya fue verificado");
  }

  if (appointment.verificationCode !== code) {
    throw new Error("Código de verificación inválido");
  }

  // Mark as verified and confirmed, mark slot as unavailable
  const [updatedAppointment] = await prisma.$transaction([
    prisma.appointment.update({
      where: { id: appointmentId },
      data: { verified: true, status: AppointmentStatus.CONFIRMED },
      include: {
        doctor: { select: { id: true, name: true } },
        patient: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.timeSlot.update({
      where: { id: appointment.timeSlotId },
      data: { available: false },
    }),
  ]);

  return updatedAppointment;
}

export async function cancelAppointment(appointmentId: string, patientEmail: string, patientDni: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { patient: true },
  });

  if (!appointment) {
    throw new Error("Turno no encontrado");
  }

  if (appointment.patient.email !== patientEmail || appointment.patient.dni !== patientDni) {
    throw new Error("No está autorizado para cancelar este turno");
  }

  if (appointment.status === AppointmentStatus.CANCELLED) {
    throw new Error("El turno ya está cancelado");
  }

  // Cancel appointment and free the slot
  const [updatedAppointment] = await prisma.$transaction([
    prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.CANCELLED },
      include: {
        doctor: { select: { id: true, name: true } },
        patient: { select: { id: true, name: true, email: true, dni: true } },
      },
    }),
    prisma.timeSlot.update({
      where: { id: appointment.timeSlotId },
      data: { available: true },
    }),
  ]);

  return updatedAppointment;
}

export async function getAppointmentsByPatient(email: string, dni: string) {
  await cleanupExpired();

  return prisma.appointment.findMany({
    where: { patient: { email, dni } },
    include: {
        doctor: { select: { id: true, name: true, avatar: true, specialties: { select: { id: true, name: true } } } },
      patient: { select: { id: true, name: true, email: true, phone: true, dni: true } },
    },
    orderBy: { date: "desc" },
  });
}

async function cleanupExpired(): Promise<void> {
  const expired = await prisma.appointment.findMany({
    where: {
      status: "PENDING",
      verified: false,
      expiresAt: { lte: new Date() },
    },
    select: { id: true, timeSlotId: true },
  });

  if (expired.length === 0) return;

  const ids = expired.map((e) => e.id);
  const slotIds = expired.map((e) => e.timeSlotId);

  await prisma.$transaction([
    prisma.appointment.deleteMany({ where: { id: { in: ids } } }),
    prisma.timeSlot.updateMany({
      where: { id: { in: slotIds } },
      data: { available: true },
    }),
  ]);
}

export async function getDoctorAppointments(doctorId: string) {
  await cleanupExpired();

  return prisma.appointment.findMany({
    where: { doctorId },
    include: {
      patient: { select: { id: true, name: true, email: true, phone: true, dni: true } },
    },
    orderBy: { date: "desc" },
  });
}

export async function getAllAppointments() {
  await cleanupExpired();

  return prisma.appointment.findMany({
    include: {
      doctor: { select: { id: true, name: true, email: true } },
      patient: { select: { id: true, name: true, email: true, phone: true, dni: true } },
    },
    orderBy: { date: "desc" },
  });
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    throw new Error("Turno no encontrado");
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
    include: {
      doctor: { select: { id: true, name: true } },
      patient: { select: { id: true, name: true, email: true } },
    },
  });

  // If cancelled, free the slot
  if (status === AppointmentStatus.CANCELLED) {
    await prisma.timeSlot.update({
      where: { id: appointment.timeSlotId },
      data: { available: true },
    });
  }

  return updated;
}

export async function deleteAppointment(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) {
    throw new Error("Turno no encontrado");
  }

  // Delete the appointment and free the slot
  await prisma.$transaction([
    prisma.appointment.delete({ where: { id: appointmentId } }),
    prisma.timeSlot.update({
      where: { id: appointment.timeSlotId },
      data: { available: true },
    }),
  ]);

  return { message: "Turno eliminado correctamente" };
}

export async function countAppointments() {
  return prisma.appointment.count();
}

export async function countAppointmentsByStatus(status: AppointmentStatus) {
  return prisma.appointment.count({ where: { status } });
}

export async function getPendingAppointment(email: string, dni: string) {
  const appointment = await prisma.appointment.findFirst({
    where: {
      patient: { email, dni },
      status: "PENDING",
      verified: false,
    },
    include: {
        doctor: { select: { id: true, name: true, avatar: true, specialties: { select: { id: true, name: true } } } },
      patient: { select: { id: true, name: true, email: true, phone: true, dni: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!appointment) {
    return null;
  }

  // Check if expired
  if (appointment.expiresAt && new Date() > appointment.expiresAt) {
    // Free the expired appointment's slot
    await prisma.$transaction([
      prisma.appointment.delete({ where: { id: appointment.id } }),
      prisma.timeSlot.update({
        where: { id: appointment.timeSlotId },
        data: { available: true },
      }),
    ]);
    return null;
  }

  // Return appointment with verification code (for mock/testing purposes)
  return {
    ...appointment,
    verificationCode: appointment.verificationCode,
  };
}

export async function requestActionCode(appointmentId: string, email: string, dni: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { patient: true },
  });

  if (!appointment) {
    throw new Error("Turno no encontrado");
  }

  if (appointment.patient.email !== email || appointment.patient.dni !== dni) {
    throw new Error("No está autorizado para realizar esta acción");
  }

  if (appointment.status === AppointmentStatus.CANCELLED) {
    throw new Error("El turno ya está cancelado");
  }

  // Generate action code
  const actionCode = generateCode();
  const actionCodeExpiresAt = new Date();
  actionCodeExpiresAt.setMinutes(actionCodeExpiresAt.getMinutes() + 15); // 15 min expiry

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { actionCode, actionCodeExpiresAt },
  });

  mockSendCode(actionCode, appointment.patient.phone);

  return { message: "Código enviado correctamente" };
}

export async function cancelWithCode(appointmentId: string, email: string, dni: string, code: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { patient: true },
  });

  if (!appointment) {
    throw new Error("Turno no encontrado");
  }

  if (appointment.patient.email !== email || appointment.patient.dni !== dni) {
    throw new Error("No está autorizado para cancelar este turno");
  }

  if (appointment.status === AppointmentStatus.CANCELLED) {
    throw new Error("El turno ya está cancelado");
  }

  verifyActionCode(appointment, code);

  // Cancel appointment and free the slot
  const [updatedAppointment] = await prisma.$transaction([
    prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.CANCELLED, actionCode: null, actionCodeExpiresAt: null },
      include: {
        doctor: { select: { id: true, name: true } },
        patient: { select: { id: true, name: true, email: true, dni: true } },
      },
    }),
    prisma.timeSlot.update({
      where: { id: appointment.timeSlotId },
      data: { available: true },
    }),
  ]);

  return updatedAppointment;
}

export async function rescheduleAppointment(
  appointmentId: string,
  email: string,
  dni: string,
  code: string,
  newTimeSlotId: string
) {
  return prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true },
    });

    if (!appointment) {
      throw new Error("Turno no encontrado");
    }

    if (appointment.patient.email !== email || appointment.patient.dni !== dni) {
      throw new Error("No está autorizado para modificar este turno");
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new Error("El turno ya está cancelado");
    }

    verifyActionCode(appointment, code);

    // Check new slot availability
    const newTimeSlot = await tx.timeSlot.findUnique({
      where: { id: newTimeSlotId },
    });

    if (!newTimeSlot) {
      throw new Error("El nuevo horario no existe");
    }

    if (newTimeSlot.doctorId !== appointment.doctorId) {
      throw new Error("El horario no pertenece al mismo médico");
    }

    if (!newTimeSlot.available) {
      throw new Error("El nuevo horario no está disponible");
    }

    // Check no existing appointment for that slot
    const existingForSlot = await tx.appointment.findUnique({
      where: { timeSlotId: newTimeSlotId },
    });
    if (existingForSlot) {
      throw new Error("El nuevo horario ya está reservado");
    }

    // Free old slot, assign new one
    await tx.timeSlot.update({
      where: { id: appointment.timeSlotId },
      data: { available: true },
    });

    await tx.timeSlot.update({
      where: { id: newTimeSlotId },
      data: { available: false },
    });

    const updated = await tx.appointment.update({
      where: { id: appointmentId },
      data: {
        timeSlotId: newTimeSlotId,
        date: newTimeSlot.date,
        startTime: newTimeSlot.startTime,
        endTime: newTimeSlot.endTime,
        actionCode: null,
        actionCodeExpiresAt: null,
      },
      include: {
        doctor: { select: { id: true, name: true, avatar: true, specialties: { select: { id: true, name: true } } } },
        patient: { select: { id: true, name: true, email: true, phone: true, dni: true } },
      },
    });

    return updated;
  });
}

function verifyActionCode(appointment: { actionCode: string | null; actionCodeExpiresAt: Date | null }, code: string) {
  if (!appointment.actionCode || !appointment.actionCodeExpiresAt) {
    throw new Error("No se ha solicitado un código de acción. Solicítelo primero.");
  }

  if (new Date() > appointment.actionCodeExpiresAt) {
    throw new Error("El código ha expirado. Solicite uno nuevo.");
  }

  if (appointment.actionCode !== code) {
    throw new Error("Código inválido");
  }
}

export async function resendVerificationCode(appointmentId: string, email: string, dni: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { patient: true },
  });

  if (!appointment) {
    throw new Error("Turno no encontrado");
  }

  if (appointment.patient.email !== email || appointment.patient.dni !== dni) {
    throw new Error("No está autorizado para este turno");
  }

  if (appointment.status !== "PENDING" || appointment.verified) {
    throw new Error("El turno no está pendiente de verificación");
  }

  // Check expiration
  if (appointment.expiresAt && new Date() > appointment.expiresAt) {
    await prisma.$transaction([
      prisma.appointment.delete({ where: { id: appointmentId } }),
      prisma.timeSlot.update({
        where: { id: appointment.timeSlotId },
        data: { available: true },
      }),
    ]);
    throw new Error("El turno ha expirado. Por favor, reserve nuevamente.");
  }

  // Generate new code
  const newCode = generateCode();

  // Extend expiration 5 more minutes
  const newExpiresAt = new Date();
  newExpiresAt.setMinutes(newExpiresAt.getMinutes() + 5);

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      verificationCode: newCode,
      expiresAt: newExpiresAt,
    },
  });

  // Send code (mock)
  mockSendCode(newCode, appointment.patient.phone);

  return { message: "Código reenviado correctamente" };
}

export async function getPendingAppointmentByToken(token: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { verificationToken: token },
    include: {
        doctor: { select: { id: true, name: true, avatar: true, specialties: { select: { id: true, name: true } } } },
      patient: { select: { id: true, name: true, email: true, phone: true, dni: true } },
    },
  });

  if (!appointment) {
    return null;
  }

  // Only return PENDING appointments
  if (appointment.status !== "PENDING" || appointment.verified) {
    return null;
  }

  // Check if expired
  if (appointment.expiresAt && new Date() > appointment.expiresAt) {
    // Free the expired appointment's slot
    await prisma.$transaction([
      prisma.appointment.delete({ where: { id: appointment.id } }),
      prisma.timeSlot.update({
        where: { id: appointment.timeSlotId },
        data: { available: true },
      }),
    ]);
    return null;
  }

  return {
    ...appointment,
    verificationCode: appointment.verificationCode,
  };
}
