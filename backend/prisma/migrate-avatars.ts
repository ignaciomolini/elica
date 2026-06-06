import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function avatarUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=200`;
}

async function main() {
  console.log("[MIGRATE] Updating doctor avatars...");

  const doctors = await prisma.doctor.findMany({
    where: { role: "DOCTOR" },
    select: { id: true, name: true, avatar: true },
  });

  let updated = 0;
  let skipped = 0;

  for (const doctor of doctors) {
    // Skip if it already looks like a real URL or uploaded file
    if (
      doctor.avatar.startsWith("http") ||
      doctor.avatar.startsWith("/uploads")
    ) {
      skipped++;
      continue;
    }

    const newAvatar = avatarUrl(doctor.name);
    await prisma.doctor.update({
      where: { id: doctor.id },
      data: { avatar: newAvatar },
    });
    console.log(`  ${doctor.name}: ${doctor.avatar} -> ${newAvatar}`);
    updated++;
  }

  console.log(`[MIGRATE] Done. Updated: ${updated}, Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error("[MIGRATE] Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
