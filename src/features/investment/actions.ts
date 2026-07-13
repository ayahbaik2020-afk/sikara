"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentFamilyMember } from "@/lib/helpers/family";

export async function createInvestment(formData: FormData) {
  const member = await getCurrentFamilyMember();
  if (!member) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const type = (formData.get("type") as string) || "OTHER";
  const amountInvested = parseFloat(formData.get("amountInvested") as string);
  const currentValue = parseFloat(formData.get("currentValue") as string);
  const note = (formData.get("note") as string) || null;

  if (!name || !amountInvested || !currentValue) {
    throw new Error("Nama, modal, dan nilai sekarang wajib diisi");
  }

  await prisma.investment.create({
    data: {
      familyId: member.familyId,
      name,
      type: type as never,
      amountInvested,
      currentValue,
      note,
    },
  });

  revalidatePath("/dashboard/investments");
}

export async function updateInvestmentValue(formData: FormData) {
  const member = await getCurrentFamilyMember();
  if (!member) throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  const currentValue = parseFloat(formData.get("currentValue") as string);
  if (!currentValue || currentValue < 0) throw new Error("Nilai tidak valid");

  await prisma.investment.update({
    where: { id, familyId: member.familyId },
    data: { currentValue },
  });

  revalidatePath("/dashboard/investments");
}

export async function deleteInvestment(formData: FormData) {
  const member = await getCurrentFamilyMember();
  if (!member) throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  await prisma.investment.delete({ where: { id, familyId: member.familyId } });

  revalidatePath("/dashboard/investments");
}
