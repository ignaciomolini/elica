import prisma from "../lib/prisma.js";

export async function getAllSpecialties() {
  return prisma.specialty.findMany({
    include: { doctors: { select: { id: true, name: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getSpecialtyById(id: string) {
  const specialty = await prisma.specialty.findUnique({
    where: { id },
    include: { doctors: { select: { id: true, name: true, avatar: true, bio: true } } },
  });

  if (!specialty) {
    throw new Error("Especialidad no encontrada");
  }

  return specialty;
}

export async function createSpecialty(data: { name: string; description: string; icon: string }) {
  return prisma.specialty.create({ data });
}

export async function updateSpecialty(id: string, data: { name?: string; description?: string; icon?: string }) {
  const specialty = await prisma.specialty.findUnique({ where: { id } });
  if (!specialty) {
    throw new Error("Especialidad no encontrada");
  }
  return prisma.specialty.update({ where: { id }, data });
}

export async function deleteSpecialty(id: string) {
  const specialty = await prisma.specialty.findUnique({
    where: { id },
    include: { doctors: true },
  });
  if (!specialty) {
    throw new Error("Especialidad no encontrada");
  }
  if (specialty.doctors.length > 0) {
    throw new Error("No se puede eliminar una especialidad con médicos asignados");
  }
  return prisma.specialty.delete({ where: { id } });
}

export async function countSpecialties() {
  return prisma.specialty.count();
}
