# ARCHITECTURE V2 — Multi-Family, Super Admin, Custom User Management

Menggantikan sebagian pekerjaan Sprint 16 (role granular lama). Auth tetap
pakai mesin Supabase Auth di balik layar, dengan email sintetis
(`{username}@sikara.internal`) supaya user hanya perlu username+password.

## Tahapan

- [ ] **A. Schema** — SystemRole (SUPER_ADMIN/FAMILY_ADMIN/MEMBER),
      Relationship (AYAH/IBU/ANAK) pindah ke FamilyMember, Family.status,
      Profile.status, validasi max 1 Ayah & max 1 Ibu per keluarga.
      Migrasi data lama (FamilyRole ADMIN/AYAH/IBU/ANAK -> systemRole +
      relationship).
- [ ] **B. Auth rework** — login username+password via email sintetis,
      hapus jejak "buat keluarga sendiri" utk non-super-admin, Admin API
      untuk create/reset password user tanpa email.
- [ ] **C. Access control rewrite** — matrix akses berbasis systemRole
      (bukan relationship lagi): Family Admin = full, Member = terbatas
      (Dashboard, Transaksi, Rekening, Tabungan, Laporan saja).
- [ ] **D. User Management UI (Family Admin)** — Tambah/Edit/Reset
      Password/Nonaktifkan/Hapus User dalam keluarganya.
- [ ] **E. Super Admin module** — Dashboard, kelola semua Family
      (buat/ubah/hapus/aktifkan/nonaktifkan), kelola Family Admin
      (buat/ubah/reset password/pindah tangan), Master Data, Pengaturan
      Sistem.
- [ ] **F. Audit Log expansion** — login, logout, tambah/ubah/hapus user,
      reset password, perubahan Family Admin, perubahan status user.

## Keputusan desain
- Auth: Supabase Auth + email sintetis (bukan custom Argon2/bcrypt dari nol).
- SUPABASE_SERVICE_ROLE_KEY wajib ditambahkan ke Environment Variables
  Vercel (bukan cuma .env lokal) sebelum Stage B di-deploy.
