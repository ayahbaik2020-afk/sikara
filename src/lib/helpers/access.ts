/**
 * Hak akses berbasis SystemRole (bukan Relationship lagi), sesuai
 * docs/ARCHITECTURE_V2.md. Family Admin = akses penuh ke modul keuangan
 * keluarganya. Member = akses terbatas (Dashboard, Transaksi, Rekening,
 * Tabungan, Laporan). Super Admin punya area terpisah (lihat access-super.ts
 * kalau ada) dan tidak memakai matrix modul keuangan ini.
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
