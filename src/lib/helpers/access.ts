/**
 * Peta hak akses per modul sesuai tabel di PRD.md bagian 6.
 * - "full": bisa CRUD penuh
 * - "view": hanya bisa melihat, tidak bisa tambah/ubah/hapus
 * - "own": hanya bisa lihat & kelola data miliknya sendiri
 * - "none": modul disembunyikan & aksinya ditolak
 */
export type AccessLevel = "full" | "view" | "own" | "none";
export type FamilyRoleType = "ADMIN" | "AYAH" | "IBU" | "ANAK";

export const MODULE_ACCESS: Record<string, Record<FamilyRoleType, AccessLevel>> = {
  dashboard:    { ADMIN: "full", AYAH: "full", IBU: "full", ANAK: "full" },
  income:       { ADMIN: "full", AYAH: "full", IBU: "full", ANAK: "own" },
  expense:      { ADMIN: "full", AYAH: "full", IBU: "full", ANAK: "own" },
  wallets:      { ADMIN: "full", AYAH: "full", IBU: "view", ANAK: "view" },
  transfer:     { ADMIN: "full", AYAH: "full", IBU: "full", ANAK: "none" },
  bills:        { ADMIN: "full", AYAH: "full", IBU: "full", ANAK: "none" },
  savings:      { ADMIN: "full", AYAH: "full", IBU: "full", ANAK: "full" },
  investments:  { ADMIN: "full", AYAH: "full", IBU: "view", ANAK: "none" },
  assets:       { ADMIN: "full", AYAH: "full", IBU: "view", ANAK: "none" },
  debts:        { ADMIN: "full", AYAH: "full", IBU: "full", ANAK: "none" },
  receivables:  { ADMIN: "full", AYAH: "full", IBU: "full", ANAK: "none" },
  reports:      { ADMIN: "full", AYAH: "full", IBU: "full", ANAK: "full" },
  notifications:{ ADMIN: "full", AYAH: "full", IBU: "full", ANAK: "full" },
  categories:   { ADMIN: "full", AYAH: "full", IBU: "view", ANAK: "view" },
  families:     { ADMIN: "full", AYAH: "view", IBU: "view", ANAK: "view" },
  settings:     { ADMIN: "full", AYAH: "none", IBU: "none", ANAK: "none" },
  auditLog:     { ADMIN: "full", AYAH: "none", IBU: "none", ANAK: "none" },
  backup:       { ADMIN: "full", AYAH: "none", IBU: "none", ANAK: "none" },
};

export function getAccess(module: keyof typeof MODULE_ACCESS, role: string): AccessLevel {
  const roleKey = (role in { ADMIN: 1, AYAH: 1, IBU: 1, ANAK: 1 } ? role : "ANAK") as FamilyRoleType;
  return MODULE_ACCESS[module]?.[roleKey] ?? "none";
}
