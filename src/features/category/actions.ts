"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentFamilyMember } from "@/lib/helpers/family";
import { getAccess } from "@/lib/helpers/access";

function assertCanEdit(role: string) {
  if (getAccess("categories", role) !== "full") {
    throw new Error("Anda tidak memiliki akses untuk mengubah kategori");
  }
}

export async function createCategory(formData: FormData) {
  const member = await getCurrentFamilyMember();
  if (!member) throw new Error("Unauthorized");
  assertCanEdit(member.role);

  const name = formData.get("name") as string;
  const type = formData.get("type") as "INCOME" | "EXPENSE";
  const icon = (formData.get("icon") as string) || "tag";
  const color = (formData.get("color") as string) || "#6366F1";

  await prisma.category.create({
    data: {
      familyId: member.familyId,
      name,
      type,
      icon,
      color,
    },
  });

  revalidatePath("/dashboard/categories");
}

export async function updateCategory(formData: FormData) {
  const member = await getCurrentFamilyMember();
  if (!member) throw new Error("Unauthorized");
  assertCanEdit(member.role);

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const type = formData.get("type") as "INCOME" | "EXPENSE";
  const icon = (formData.get("icon") as string) || "tag";
  const color = (formData.get("color") as string) || "#6366F1";

  await prisma.category.update({
    where: { id, familyId: member.familyId },
    data: { name, type, icon, color },
  });

  revalidatePath("/dashboard/categories");
}

export async function deleteCategory(formData: FormData) {
  const member = await getCurrentFamilyMember();
  if (!member) throw new Error("Unauthorized");
  assertCanEdit(member.role);

  const id = formData.get("id") as string;

  await prisma.category.delete({
    where: { id, familyId: member.familyId },
  });

  revalidatePath("/dashboard/categories");
}
