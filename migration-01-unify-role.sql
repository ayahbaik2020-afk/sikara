-- =========================================================
-- MIGRATION: Unify Role -> SystemRole
-- Stage 1 dari Sikara Refactor (Profile Role)
-- Jalankan di: Supabase Dashboard > SQL Editor
-- =========================================================
-- Efek:
--   1. enum "SystemRole" ditambah nilai SUPER_ADMIN
--   2. kolom profiles.role (enum "Role" lama) DIHAPUS
--   3. kolom profiles."isSuperAdmin" DIHAPUS
--   4. kolom profiles.role BARU ditambahkan, bertipe "SystemRole", default MEMBER
--   5. Data lama dipindahkan: siapa yang dulu isSuperAdmin = true, sekarang role = SUPER_ADMIN
--   6. enum "Role" lama DIHAPUS (sudah tidak dipakai)
--
-- AMAN dijalankan berkali-kali? TIDAK. Jalankan sekali saja.
-- Rollback: lihat blok paling bawah (dikomentari).
-- =========================================================

begin;

-- 1. Tambah nilai baru ke enum SystemRole yang sudah ada
alter type "SystemRole" add value if not exists 'SUPER_ADMIN';

commit;

-- ALTER TYPE ... ADD VALUE tidak boleh dipakai dalam transaction yang sama
-- dengan statement berikutnya yang memakai nilai itu, makanya di-commit dulu.

begin;

-- 2. Simpan sementara siapa saja yang superadmin, sebelum kolom lama dihapus
create temporary table _tmp_superadmins as
select id from public.profiles where "isSuperAdmin" = true;

-- 3. Tambah kolom role BARU bertipe SystemRole (sementara nullable dulu)
alter table public.profiles add column role_new "SystemRole";

-- 4. Isi kolom baru: SUPER_ADMIN untuk yang dulu isSuperAdmin, sisanya MEMBER
update public.profiles
set role_new = case
  when id in (select id from _tmp_superadmins) then 'SUPER_ADMIN'::"SystemRole"
  else 'MEMBER'::"SystemRole"
end;

-- 5. Hapus kolom lama (role lama bertipe enum "Role", dan isSuperAdmin)
alter table public.profiles drop column role;
alter table public.profiles drop column "isSuperAdmin";

-- 6. Rename kolom baru jadi "role", set NOT NULL + default
alter table public.profiles rename column role_new to role;
alter table public.profiles alter column role set default 'MEMBER'::"SystemRole";
alter table public.profiles alter column role set not null;

-- 7. Hapus enum "Role" lama (sudah tidak dipakai kolom manapun)
drop type if exists "Role";

commit;

-- =========================================================
-- Verifikasi setelah run (jalankan terpisah untuk cek hasil):
-- select id, username, email, role from public.profiles;
-- =========================================================


-- =========================================================
-- ROLLBACK (jalankan manual kalau perlu membatalkan migration ini)
-- =========================================================
-- begin;
-- create type "Role" as enum ('ADMIN', 'MEMBER');
-- alter table public.profiles add column "isSuperAdmin" boolean not null default false;
-- update public.profiles set "isSuperAdmin" = true where role = 'SUPER_ADMIN';
-- alter table public.profiles add column role_old "Role" not null default 'MEMBER';
-- alter table public.profiles drop column role;
-- alter table public.profiles rename column role_old to role;
-- -- catatan: nilai SUPER_ADMIN pada enum SystemRole tidak bisa dihapus otomatis
-- -- oleh Postgres (ALTER TYPE ... DROP VALUE tidak didukung). Kalau perlu benar-benar
-- -- hilangkan, harus buat ulang tipe SystemRole dari nol. Biasanya tidak perlu.
-- commit;
