"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentFamilyMember } from "@/lib/helpers/family";

export async function createSavingsGoal(formData: FormData) {
  const member = await getCurrentFamilyMember();
  if (!member) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const targetAmountRaw = formData.get("targetAmount") as string;
  const targetDateRaw = formData.get("targetDate") as string;
  const note = (formData.get("note") as string) || null;

  if (!name) throw new Error("Nama wajib diisi");

  await prisma.savingsGoal.create({
    data: {
      familyId: member.familyId,
      name,
      targetAmount: targetAmountRaw ? parseFloat(targetAmountRaw) : null,
      targetDate: targetDateRaw ? new Date(targetDateRaw) : null,
      note,
    },
  });

  revalidatePath("/dashboard/savings");
}

export async function deleteSavingsGoal(formData: FormData) {
  const member = await getCurrentFamilyMember();
  if (!member) throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  await prisma.savingsGoal.delete({
    where: { id, familyId: member.familyId },
  });

  revalidatePath("/dashboard/savings");
}

export async function addContribution(formData: FormData) {
  const member = await getCurrentFamilyMember();
  if (!member) throw new Error("Unauthorized");

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  const walletId = formData.get("walletId") as string;
  const amount = parseFloat(formData.get("amount") as string);

  if (!amount || amount <= 0) throw new Error("Nominal harus lebih dari 0");

  const [goal, wallet] = await Promise.all([
    prisma.savingsGoal.findUnique({ where: { id, familyId: member.familyId } }),
    prisma.wallet.findUnique({ where: { id: walletId, familyId: member.familyId } }),
  ]);
  if (!goal) throw new Error("Target tabungan tidak ditemukan");
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
        description: `Menabung: ${goal.name}`,
        transactionDate: new Date(),
      },
    }),
    prisma.wallet.update({
      where: { id: walletId },
      data: { balance: { decrement: amount } },
    }),
    prisma.savingsGoal.update({
      where: { id },
      data: { currentAmount: { increment: amount } },
    }),
  ]);

  revalidatePath("/dashboard/savings");
  revalidatePath("/dashboard");
}
