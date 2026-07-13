"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentFamilyMember } from "@/lib/helpers/family";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/helpers/audit";

export async function createReceivable(formData: FormData) {
  const member = await getCurrentFamilyMember();
  if (!member) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const dueDateRaw = formData.get("dueDate") as string;
  const note = (formData.get("note") as string) || null;

  if (!name || !amount) throw new Error("Nama dan nominal wajib diisi");

  await prisma.receivable.create({
    data: {
      familyId: member.familyId,
      name,
      amount,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      note,
    },
  });

  revalidatePath("/dashboard/receivables");
}

export async function deleteReceivable(formData: FormData) {
  const member = await getCurrentFamilyMember();
  if (!member) throw new Error("Unauthorized");
  const id = formData.get("id") as string;
  await prisma.receivable.delete({ where: { id, familyId: member.familyId } });
  revalidatePath("/dashboard/receivables");
}

export async function receivePayment(formData: FormData) {
  const member = await getCurrentFamilyMember();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!member || !user) throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  const walletId = formData.get("walletId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  if (!amount || amount <= 0) throw new Error("Nominal harus lebih dari 0");

  const [receivable, wallet] = await Promise.all([
    prisma.receivable.findUnique({ where: { id, familyId: member.familyId } }),
    prisma.wallet.findUnique({ where: { id: walletId, familyId: member.familyId } }),
  ]);
  if (!receivable) throw new Error("Piutang tidak ditemukan");
  if (!wallet) throw new Error("Dompet tidak ditemukan");

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        familyId: member.familyId,
        walletId,
        profileId: user.id,
        type: "INCOME",
        amount,
        description: `Terima piutang: ${receivable.name}`,
        transactionDate: new Date(),
      },
    }),
    prisma.wallet.update({
      where: { id: walletId },
      data: { balance: { increment: amount } },
    }),
    prisma.receivable.update({
      where: { id },
      data: { paidAmount: { increment: amount } },
    }),
  ]);

  revalidatePath("/dashboard/receivables");
  revalidatePath("/dashboard");
  await logAudit(
    member.familyId,
    "RECEIVE_PAYMENT",
    `Menerima piutang "${receivable.name}" Rp ${amount.toLocaleString("id-ID")}`
  );
}
