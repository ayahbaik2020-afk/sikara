"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentFamilyMember } from "@/lib/helpers/family";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/helpers/audit";

export async function createTransaction(formData: FormData) {
  const member = await getCurrentFamilyMember();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!member || !user) throw new Error("Unauthorized");

  const type = formData.get("type") as "INCOME" | "EXPENSE";
  const walletId = formData.get("walletId") as string;
  const categoryId = formData.get("categoryId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const description = formData.get("description") as string;
  const transactionDate = formData.get("transactionDate") as string;

  if (!amount || amount <= 0) throw new Error("Nominal harus lebih dari 0");

  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId, familyId: member.familyId },
  });
  if (!wallet) throw new Error("Dompet tidak ditemukan");

  if (type === "EXPENSE" && Number(wallet.balance) < amount) {
    throw new Error("Saldo dompet tidak mencukupi");
  }

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        familyId: member.familyId,
        walletId,
        categoryId,
        profileId: user.id,
        type,
        amount,
        description: description || null,
        transactionDate: transactionDate
          ? new Date(transactionDate)
          : new Date(),
      },
    }),
    prisma.wallet.update({
      where: { id: walletId },
      data: {
        balance: {
          [type === "INCOME" ? "increment" : "decrement"]: amount,
        },
      },
    }),
  ]);

  const path = type === "INCOME" ? "/dashboard/income" : "/dashboard/expense";
  revalidatePath(path);
  revalidatePath("/dashboard");
  await logAudit(
    member.familyId,
    type === "INCOME" ? "CREATE_INCOME" : "CREATE_EXPENSE",
    `${type === "INCOME" ? "Menambah pemasukan" : "Menambah pengeluaran"} Rp ${amount.toLocaleString("id-ID")}${description ? ` (${description})` : ""}`
  );
}

export async function deleteTransaction(formData: FormData) {
  const member = await getCurrentFamilyMember();
  if (!member) throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  const type = formData.get("type") as "INCOME" | "EXPENSE";

  const transaction = await prisma.transaction.findUnique({
    where: { id, familyId: member.familyId },
  });
  if (!transaction) throw new Error("Transaksi tidak ditemukan");

  await prisma.$transaction([
    prisma.wallet.update({
      where: { id: transaction.walletId },
      data: {
        balance: {
          [transaction.type === "INCOME" ? "decrement" : "increment"]:
            transaction.amount,
        },
      },
    }),
    prisma.transaction.delete({ where: { id } }),
  ]);

  const path = type === "INCOME" ? "/dashboard/income" : "/dashboard/expense";
  revalidatePath(path);
  revalidatePath("/dashboard");
  await logAudit(
    member.familyId,
    "DELETE_TRANSACTION",
    `Menghapus ${transaction.type === "INCOME" ? "pemasukan" : "pengeluaran"} Rp ${Number(transaction.amount).toLocaleString("id-ID")}`
  );
}
