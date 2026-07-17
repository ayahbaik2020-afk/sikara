/**
 * BACKUP PENUH — database aplikasi (Prisma) + daftar user Auth Supabase.
 * Hasilnya file-file JSON di folder ./backup-YYYY-MM-DD/ di komputer kamu.
 *
 * TIDAK mengubah/menghapus apa pun di database asli — murni baca & simpan.
 *
 * Cara pakai:
 *   npx tsx backup-full.ts
 *
 * Butuh .env yang sudah ada DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL,
 * dan SUPABASE_SERVICE_ROLE_KEY (sama seperti yang sudah kamu pakai).
 */

import * as dotenv from "dotenv";
dotenv.config();

import * as fs from "fs";
import * as path from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./src/generated/prisma/client";
import { createClient } from "@supabase/supabase-js";

const DATABASE_URL = process.env.DATABASE_URL;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!DATABASE_URL || !SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error(
    "Pastikan DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ada di .env",
  );
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: DATABASE_URL }) });
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const today = new Date().toISOString().slice(0, 10);
const outDir = path.join(process.cwd(), `backup-${today}`);

function save(filename: string, data: unknown) {
  fs.writeFileSync(path.join(outDir, filename), JSON.stringify(data, null, 2), "utf-8");
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  console.log(`Menyimpan backup ke: ${outDir}\n`);

  // --- Tabel aplikasi (public schema, dikelola Prisma) ---
  const tables: { name: string; fetch: () => Promise<unknown[]> }[] = [
    { name: "profiles", fetch: () => prisma.profile.findMany() },
    { name: "families", fetch: () => prisma.family.findMany() },
    { name: "family_members", fetch: () => prisma.familyMember.findMany() },
    { name: "categories", fetch: () => prisma.category.findMany() },
    { name: "wallets", fetch: () => prisma.wallet.findMany() },
    { name: "settings", fetch: () => prisma.setting.findMany() },
    { name: "bills", fetch: () => prisma.bill.findMany() },
    { name: "savings_goals", fetch: () => prisma.savingsGoal.findMany() },
    { name: "assets", fetch: () => prisma.asset.findMany() },
    { name: "investments", fetch: () => prisma.investment.findMany() },
    { name: "debts", fetch: () => prisma.debt.findMany() },
    { name: "receivables", fetch: () => prisma.receivable.findMany() },
    { name: "transactions", fetch: () => prisma.transaction.findMany() },
    { name: "audit_logs", fetch: () => prisma.auditLog.findMany() },
  ];

  for (const t of tables) {
    const rows = await t.fetch();
    save(`${t.name}.json`, rows);
    console.log(`✅ ${t.name}: ${rows.length} baris`);
  }

  // --- Auth Supabase (daftar user) ---
  // Catatan: Supabase TIDAK PERNAH mengekspos password hash lewat API,
  // jadi backup ini menyimpan identitas user (email/username/id/metadata),
  // TAPI TIDAK bisa dipakai untuk restore password. Password lama tidak
  // bisa "dipulihkan" lewat cara apa pun (memang didesain begitu demi
  // keamanan) — kalau nanti pindah project Supabase, user harus di-reset
  // passwordnya lewat Super Admin/Family Admin seperti alur normal.
  let allUsers: unknown[] = [];
  let page = 1;
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    allUsers = allUsers.concat(data.users);
    if (data.users.length < 200) break;
    page++;
  }
  save("auth_users.json", allUsers);
  console.log(`✅ auth_users: ${allUsers.length} akun (TANPA password, lihat catatan di kode)`);

  console.log(`\nSelesai. Backup tersimpan di folder: ${outDir}`);
  console.log("Simpan folder ini di luar komputer juga (Google Drive/eksternal) untuk jaga-jaga.");
}

main()
  .catch((err) => {
    console.error("❌ Backup gagal:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
