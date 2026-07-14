"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentFamilyMember } from "@/lib/helpers/family";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/helpers/audit";
import { getAccess } from "@/lib/helpers/access";

function assertCanEdit(role: string) {
  if (getAccess("debts", role) === "none") {
    throw new Error("Anda tidak memiliki akses ke Hutang");
  }
}

export async function createDebt(formData: FormData) {
  const member = await getCurrentFamilyMember();
  if (!member) throw new Error("Unauthorized");
  assertCanEdit(member.systemRole);

  const name = formData.get("name") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const dueDateRaw = formData.get("dueDate") as string;
  const note = (formData.get("note") as string) || null;

  if (!name || !amount) throw new Error("Nama dan nominal wajib diisi");

  await prisma.debt.create({
    data: {
      familyId: member.familyId,
      name,
      amount,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      note,
    },
  });

  revalidatePath("/dashboard/debts");
}

export async function deleteDebt(formData: FormData) {
  const member = await getCurrentFamilyMember();
  if (!member) throw new Error("Unauthorized");
  assertCanEdit(member.systemRole);
  const id = formData.get("id") as string;
  await prisma.debt.delete({ where: { id, familyId: member.familyId } });
  revalidatePath("/dashboard/debts");
}

export async function payDebt(formData: FormData) {
  const member = await getCurrentFamilyMember();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!member || !user) throw new Error("Unauthorized");
  assertCanEdit(member.systemRole);

  const id = formData.get("id") as string;
  const walletId = formData.get("walletId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  if (!amount || amount <= 0) throw new Error("Nominal harus lebih dari 0");

  const [debt, wallet] = await Promise.all([
    prisma.debt.findUnique({ where: { id, familyId: member.familyId } }),
    prisma.wallet.findUnique({ where: { id: walletId, familyId: member.familyId } }),
  ]);
  if (!debt) throw new Error("Hutang tidak ditemukan");
  if (!wallet) throw new Error("Dompet tidak ditemukan");
  if (Number(wallet.balance) < amount) throw new Error("Saldo dompet tidak mencukupi");

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        familyId: member.familyId,
        walletId,
        profileId: user.id,
        type: "EXPENSE",
        amount,
        description: `Bayar hutang: ${debt.name}`,
        transactionDate: new Date(),
      },
    }),
    prisma.wallet.update({
      where: { id: walletId },
      data: { balance: { decrement: amount } },
    }),
    prisma.debt.update({
      where: { id },
      data: { paidAmount: { increment: amount } },
    }),
  ]);

  revalidatePath("/dashboard/debts");
  revalidatePath("/dashboard");
  await logAudit(
    member.familyId,
    "PAY_DEBT",
    `Membayar hutang "${debt.name}" Rp ${amount.toLocaleString("id-ID")}`
  );
}
