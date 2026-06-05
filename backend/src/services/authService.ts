import bcrypt from "bcryptjs";
import { signToken } from "../utils/jwt.js";
import { getDoctorByEmail } from "./doctorService.js";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function login(email: string, password: string) {
  const doctor = await getDoctorByEmail(email);

  if (!doctor) {
    throw new Error("Credenciales inválidas");
  }

  const isValid = await verifyPassword(password, doctor.password);

  if (!isValid) {
    throw new Error("Credenciales inválidas");
  }

  const token = signToken({
    doctorId: doctor.id,
    email: doctor.email,
    role: doctor.role,
  });

  return {
    token,
    doctor: {
      id: doctor.id,
      name: doctor.name,
      email: doctor.email,
      role: doctor.role,
      avatar: doctor.avatar,
      bio: doctor.bio,
    },
  };
}
