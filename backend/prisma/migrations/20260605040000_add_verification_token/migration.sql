-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN "verificationToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_verificationToken_key" ON "Appointment"("verificationToken");
