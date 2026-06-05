import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

const specialties = [
  { name: "Cardiología", description: "Corazón y sistema cardiovascular", icon: "heart" },
  { name: "Dermatología", description: "Piel, cabello y uñas", icon: "skin" },
  { name: "Pediatría", description: "Atención de niños y adolescentes", icon: "baby" },
  { name: "Traumatología", description: "Huesos, articulaciones y músculos", icon: "bone" },
  { name: "Neurología", description: "Cerebro y sistema nervioso", icon: "brain" },
  { name: "Oftalmología", description: "Cuidado y cirugía de ojos", icon: "eye" },
];

const doctors = [
  { name: "Dra. Maria Garcia", email: "maria@elica.com", avatar: "mg", bio: "Cardióloga con 15 años de experiencia", specialtyIndex: 0 },
  { name: "Dr. Carlos Lopez", email: "carlos@elica.com", avatar: "cl", bio: "Dermatólogo especializado en procedimientos estéticos", specialtyIndex: 1 },
  { name: "Dra. Ana Martinez", email: "ana@elica.com", avatar: "am", bio: "Pediatra enfocada en cuidado neonatal", specialtyIndex: 2 },
  { name: "Dr. Roberto Sanchez", email: "roberto@elica.com", avatar: "rs", bio: "Cirujano ortopédico especializado en lesiones deportivas", specialtyIndex: 3 },
  { name: "Dra. Laura Fernandez", email: "laura@elica.com", avatar: "lf", bio: "Neuróloga con experiencia en tratamiento de migrañas", specialtyIndex: 4 },
  { name: "Dr. Diego Ramirez", email: "diego@elica.com", avatar: "dr", bio: "Oftalmólogo especializado en cirugía láser", specialtyIndex: 5 },
  { name: "Dra. Sofia Torres", email: "sofia@elica.com", avatar: "st", bio: "Cardióloga enfocada en cardiología preventiva", specialtyIndex: 0 },
  { name: "Dr. Miguel Herrera", email: "miguel@elica.com", avatar: "mh", bio: "Pediatra con 10 años de experiencia", specialtyIndex: 2 },
  { name: "Dra. Valentina Cruz", email: "valentina@elica.com", avatar: "vc", bio: "Dermatóloga especializada en dermatología pediátrica", specialtyIndex: 1 },
  { name: "Dr. Andres Morales", email: "andres@elica.com", avatar: "am2", bio: "Ortopedista especializado en reemplazo articular", specialtyIndex: 3 },
];

function generateTimeSlots() {
  const slots = [];
  for (let hour = 9; hour < 18; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const startH = String(hour).padStart(2, "0");
      const startM = String(min).padStart(2, "0");
      const endMin = min + 30;
      const endH = endMin >= 60 ? String(hour + 1).padStart(2, "0") : startH;
      const endM = endMin >= 60 ? "00" : "30";
      slots.push({
        startTime: `${startH}:${startM}`,
        endTime: `${endH}:${endM}`,
      });
    }
  }
  return slots;
}

async function main() {
  console.log("[SEED] Starting database seed...");

  // Clean existing data
  await prisma.appointment.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.specialty.deleteMany();
  console.log("[SEED] Cleaned existing data");

  // Create specialties
  const createdSpecialties = [];
  for (const s of specialties) {
    const created = await prisma.specialty.create({ data: s });
    createdSpecialties.push(created);
  }
  console.log(`[SEED] Created ${createdSpecialties.length} specialties`);

  // Create admin doctor
  const adminPassword = await bcrypt.hash("admin123", SALT_ROUNDS);
  const adminDoctor = await prisma.doctor.create({
    data: {
      name: "Admin Elica",
      email: "admin@elica.com",
      password: adminPassword,
      role: "ADMIN",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      bio: "Administrador del sistema",
    },
  });
  console.log(`[SEED] Created admin doctor: ${adminDoctor.email}`);

  // Create regular doctors
  const hashedPassword = await bcrypt.hash("admin123", SALT_ROUNDS);
  const createdDoctors = [];
  for (const d of doctors) {
    const { specialtyIndex, ...doctorData } = d;
    const created = await prisma.doctor.create({
      data: {
        ...doctorData,
        password: hashedPassword,
        role: "DOCTOR",
        specialties: {
          connect: { id: createdSpecialties[specialtyIndex].id },
        },
      },
    });
    createdDoctors.push(created);
  }
  console.log(`[SEED] Created ${createdDoctors.length} doctors`);

  // Create time slots for next 7 days
  const timeSlots = generateTimeSlots();
  let totalSlots = 0;

  for (const doctor of createdDoctors) {
    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() + dayOffset);
      date.setHours(0, 0, 0, 0);

      for (const slot of timeSlots) {
        await prisma.timeSlot.create({
          data: {
            doctorId: doctor.id,
            date,
            startTime: slot.startTime,
            endTime: slot.endTime,
          },
        });
        totalSlots++;
      }
    }
  }
  console.log(`[SEED] Created ${totalSlots} time slots`);

  console.log("[SEED] Database seeded successfully");
}

main()
  .catch((e) => {
    console.error("[SEED] Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
