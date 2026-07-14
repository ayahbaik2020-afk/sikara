/**
 * Hak akses berbasis SystemRole, sesuai docs/ARCHITECTURE_V2.md dan
 * SIKARA Master Refactor Prompt.
 *
 * - FAMILY_ADMIN = akses penuh ke modul keuangan keluarganya (dicek dari
 *   FamilyMember.systemRole).
 * - MEMBER = akses terbatas (Dashboard, Transaksi, Rekening, Tabungan, Laporan).
 * - SUPER_ADMIN = role global (dicek dari Profile.role, bukan FamilyMember),
 *   dipakai khusus untuk area /dashboard/super (kelola seluruh family).
 *   Tidak dicek lewat getAccess() ini karena super admin tidak beroperasi di
 *   dalam matrix modul keuangan satu family — dia mengelola lintas family.
 */
export type AccessLevel = "full" | "none";
export type SystemRoleType = "FAMILY_ADMIN" | "MEMBER";

const MEMBER_ALLOWED_MODULES = new Set([
  "dashboard",
  "income",
  "expense",
  "transfer",
  "wallets",
  "savings",
  "reports",
  "notifications",
]);

export function getAccess(module: string, systemRole: string): AccessLevel {
  if (systemRole === "FAMILY_ADMIN") return "full";
  return MEMBER_ALLOWED_MODULES.has(module) ? "full" : "none";
}

/**
 * Cek apakah sebuah profile adalah Super Admin (role global).
 * Dipakai untuk gating area /dashboard/super, terpisah dari getAccess().
 */
export function isSuperAdmin(profileRole: string): boolean {
  return profileRole === "SUPER_ADMIN";
}
