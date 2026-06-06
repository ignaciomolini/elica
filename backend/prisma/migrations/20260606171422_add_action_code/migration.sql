-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "actionCode" TEXT,
ADD COLUMN     "actionCodeExpiresAt" TIMESTAMP(3);
