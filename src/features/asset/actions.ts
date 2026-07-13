"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentFamilyMember } from "@/lib/helpers/family";

export async function createAsset(formData: FormData) {
  const member = await getCurrentFamilyMember();
  if (!member) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const category = (formData.get("category") as string) || "OTHER";
  const purchaseValue = parseFloat(formData.get("purchaseValue") as string);
  const currentValue = parseFloat(formData.get("currentValue") as string);
  const purchaseDateRaw = formData.get("purchaseDate") as string;
  const note = (formData.get("note") as string) || null;

  if (!name || !purchaseValue || !currentValue) {
    throw new Error("Nama, nilai beli, dan nilai sekarang wajib diisi");
  }

  await prisma.asset.create({
    data: {
      familyId: member.familyId,
      name,
      category: category as never,
      purchaseValue,
      currentValue,
      purchaseDate: purchaseDateRaw ? new Date(purchaseDateRaw) : null,
      note,
    },
  });

  revalidatePath("/dashboard/assets");
}

export async function updateAssetValue(formData: FormData) {
  const member = await getCurrentFamilyMember();
  if (!member) throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  const currentValue = parseFloat(formData.get("currentValue") as string);
  if (!currentValue || currentValue < 0) throw new Error("Nilai tidak valid");

  await prisma.asset.update({
    where: { id, familyId: member.familyId },
    data: { currentValue },
  });

  revalidatePath("/dashboard/assets");
}

export async function deleteAsset(formData: FormData) {
  const member = await getCurrentFamilyMember();
  if (!member) throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  await prisma.asset.delete({ where: { id, familyId: member.familyId } });

  revalidatePath("/dashboard/assets");
}
