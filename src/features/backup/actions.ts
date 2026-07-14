"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentFamilyMember } from "@/lib/helpers/family";
import { logAudit } from "@/lib/helpers/audit";
import { getAccess } from "@/lib/helpers/access";

/**
 * Restore data dari file backup JSON. HANYA bisa restore ke keluarga yang
 * SAMA dengan yang di-export (untuk mencegah restore ke keluarga orang
 * lain secara tidak sengaja). Proses ini MENGHAPUS seluruh data finansial
 * keluarga saat ini lalu menggantinya dengan isi backup — dipakai untuk
 * pemulihan bencana (misal salah hapus data), bukan untuk migrasi/merge.
 */
export async function restoreBackup(formData: FormData) {
  const member = await getCurrentFamilyMember();
  if (!member) throw new Error("Unauthorized");
  if (getAccess("backup", member.role) === "none") {
    throw new Error("Anda tidak memiliki akses untuk restore data");
  }

  const file = formData.get("file") as File;
  if (!file || file.size === 0) throw new Error("File backup wajib dipilih");

  const text = await file.text();
  let backup: {
    version: number;
    familyId: string;
    data: Record<string, unknown[] | unknown>;
  };
  try {
    backup = JSON.parse(text);
  } catch {
    throw new Error("File bukan JSON backup yang valid");
  }

  if (backup.familyId !== member.familyId) {
    throw new Error(
      "File backup ini berasal dari keluarga lain — tidak bisa di-restore ke sini"
    );
  }

  const { familyId } = member;
  const d = backup.data as Record<string, unknown[]>;

  await prisma.$transaction([
    // Hapus data lama (child dulu supaya tidak kena constraint FK)
    prisma.transaction.deleteMany({ where: { familyId } }),
    prisma.bill.deleteMany({ where: { familyId } }),
    prisma.savingsGoal.deleteMany({ where: { familyId } }),
    prisma.asset.deleteMany({ where: { familyId } }),
    prisma.investment.deleteMany({ where: { familyId } }),
    prisma.debt.deleteMany({ where: { familyId } }),
    prisma.receivable.deleteMany({ where: { familyId } }),
    prisma.wallet.deleteMany({ where: { familyId } }),
    prisma.category.deleteMany({ where: { familyId } }),
  ]);

  await prisma.$transaction([
    // Buat ulang data (parent dulu)
    ...(d.wallets?.length
      ? [prisma.wallet.createMany({ data: d.wallets as never[] })]
      : []),
    ...(d.categories?.length
      ? [prisma.category.createMany({ data: d.categories as never[] })]
      : []),
    ...(d.transactions?.length
      ? [prisma.transaction.createMany({ data: d.transactions as never[] })]
      : []),
    ...(d.bills?.length
      ? [prisma.bill.createMany({ data: d.bills as never[] })]
      : []),
    ...(d.savingsGoals?.length
      ? [prisma.savingsGoal.createMany({ data: d.savingsGoals as never[] })]
      : []),
    ...(d.assets?.length
      ? [prisma.asset.createMany({ data: d.assets as never[] })]
      : []),
    ...(d.investments?.length
      ? [prisma.investment.createMany({ data: d.investments as never[] })]
      : []),
    ...(d.debts?.length
      ? [prisma.debt.createMany({ data: d.debts as never[] })]
      : []),
    ...(d.receivables?.length
      ? [prisma.receivable.createMany({ data: d.receivables as never[] })]
      : []),
  ]);

  revalidatePath("/dashboard", "layout");
  await logAudit(
    familyId,
    "RESTORE_BACKUP",
    `Restore data dari file backup (${new Date().toLocaleString("id-ID")})`
  );
}
