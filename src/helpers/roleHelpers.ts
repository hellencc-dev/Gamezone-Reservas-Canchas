export type UserRole = "client" | "admin";

const ADMIN_DOMAIN = "@gamezone.com";

export function getRoleByEmail(email: string): UserRole {
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail.endsWith(ADMIN_DOMAIN)) {
    return "admin";
  }

  return "client";
}