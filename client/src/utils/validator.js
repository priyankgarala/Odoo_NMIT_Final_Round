import { z } from "zod";

// utils/validators.js
export function validateName(name) {
  if (!/[A-Z]/.test(name)) {
    return "Name must contain at least one uppercase letter";
  }
  return "";
}
  
export function validatePassword(password) {
  const hasMinLength = password.length >= 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!(hasMinLength && hasLower && hasUpper && hasSpecial)) {
    return "Password must be 8+ chars, with 1 lowercase, 1 uppercase, 1 special";
  }
  return "";
}
  

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});