"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentFamilyMember } from "@/lib/helpers/family";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/helpers/audit";

export async function createBill(formData: FormData) {
  const member = await getCurrentFamilyMember();
  if (!member) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const dueDate = formData.get("dueDate") as string;
  const recurrence = (formData.get("recurrence") as string) || "ONCE";
  const note = (formData.get("note") as string) || null;

  if (!name || !amount || amount <= 0 || !dueDate) {
    throw new Error("Nama, nominal, dan tanggal jatuh tempo wajib diisi");
  }

  await prisma.bill.create({
    data: {
      familyId: member.familyId,
      name,
      amount,
      dueDate: new Date(dueDate),
      recurrence: recurrence as never,
      note,
    },
  });

  revalidatePath("/dashboard/bills");
  revalidatePath("/dashboard");
}

export async function deleteBill(formData: FormData) {
  const member = await getCurrentFamilyMember();
  if (!member) throw new Error("Unauthorized");

  const id = formData.get("id") as string;

  await prisma.bill.delete({
    where: { id, familyId: member.familyId },
  });

  revalidatePath("/dashboard/bills");
  revalidatePath("/dashboard");
}

/**
 * Menandai tagihan sudah dibayar: buat Transaction EXPENSE (mengurangi saldo
 * dompet terpilih) dan ubah status Bill menjadi PAID. Jika recurrence bukan
 * ONCE, jadwalkan ulang dueDate ke periode berikutnya dan kembalikan status
 * ke UNPAID (siklus tagihan berulang).
 */
export async function payBill(formData: FormData) {
  const member = await getCurrentFamilyMember();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!member || !user) throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  const walletId = formData.get("walletId") as string;

  const bill = await prisma.bill.findUnique({
    where: { id, familyId: member.familyId },
  });
  if (!bill) throw new Error("Tagihan tidak ditemukan");
  if (bill.status === "PAID") throw new Error("Tagihan sudah dibayar");

  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId, familyId: member.familyId },
  });
  if (!wallet) throw new Error("Dompet tidak ditemukan");
  if (Number(wallet.balance) < Number(bill.amount)) {
    throw new Error("Saldo dompet tidak mencukupi");
  }

  const nextDueDate = (() => {
    const d = new Date(bill.dueDate);
    if (bill.recurrence === "WEEKLY") d.setDate(d.getDate() + 7);
    else if (bill.recurrence === "MONTHLY") d.setMonth(d.getMonth() + 1);
    else if (bill.recurrence === "YEARLY") d.setFullYear(d.getFullYear() + 1);
    return d;
  })();

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        familyId: member.familyId,
        walletId,
        profileId: user.id,
        type: "EXPENSE",
        amount: bill.amount,
        description: `Bayar tagihan: ${bill.name}`,
        transactionDate: new Date(),
      },
    }),
    prisma.wallet.update({
      where: { id: walletId },
      data: { balance: { decrement: bill.amount } },
    }),
    prisma.bill.update({
      where: { id },
      data:
        bill.recurrence === "ONCE"
          ? { status: "PAID" }
          : { status: "UNPAID", dueDate: nextDueDate },
    }),
  ]);

  revalidatePath("/dashboard/bills");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expense");
  await logAudit(
    member.familyId,
    "PAY_BILL",
    `Membayar tagihan "${bill.name}" Rp ${Number(bill.amount).toLocaleString("id-ID")}`
  );
}
