"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentFamilyMember } from "@/lib/helpers/family";
import { getAccess } from "@/lib/helpers/access";

function assertCanEdit(systemRole: string) {
  if (getAccess("wallets", systemRole) !== "full") {
    throw new Error("Anda tidak memiliki akses untuk mengubah dompet");
  }
}

export async function createWallet(formData: FormData) {
  const member = await getCurrentFamilyMember();
  if (!member) throw new Error("Unauthorized");
  assertCanEdit(member.systemRole);

  const name = formData.get("name") as string;
  const type = formData.get("type") as "CASH" | "BANK" | "E_WALLET";
  const balance = parseFloat(formData.get("balance") as string) || 0;
  const icon = (formData.get("icon") as string) || "wallet";
  const color = (formData.get("color") as string) || "#3B82F6";

  await prisma.wallet.create({
    data: {
      familyId: member.familyId,
      name,
      type,
      balance,
      icon,
      color,
    },
  });

  revalidatePath("/dashboard/wallets");
}

export async function updateWallet(formData: FormData) {
  const member = await getCurrentFamilyMember();
  if (!member) throw new Error("Unauthorized");
  assertCanEdit(member.systemRole);

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const type = formData.get("type") as "CASH" | "BANK" | "E_WALLET";
  const icon = (formData.get("icon") as string) || "wallet";
  const color = (formData.get("color") as string) || "#3B82F6";

  await prisma.wallet.update({
    where: { id, familyId: member.familyId },
    data: { name, type, icon, color },
  });

  revalidatePath("/dashboard/wallets");
}

export async function deleteWallet(formData: FormData) {
  const member = await getCurrentFamilyMember();
  if (!member) throw new Error("Unauthorized");
  assertCanEdit(member.systemRole);

  const id = formData.get("id") as string;

  await prisma.wallet.delete({
    where: { id, familyId: member.familyId },
  });

  revalidatePath("/dashboard/wallets");
}
