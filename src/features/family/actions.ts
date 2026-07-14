"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function createFamily(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;

  await prisma.family.create({
    data: {
      name,
      members: {
        create: {
          profileId: user.id,
          role: "ADMIN",
        },
      },
    },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function joinFamily(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const inviteCode = formData.get("inviteCode") as string;

  const family = await prisma.family.findUnique({
    where: { inviteCode },
  });

  if (!family) {
    throw new Error("Kode undangan tidak valid");
  }

  const existing = await prisma.familyMember.findUnique({
    where: { profileId_familyId: { profileId: user.id, familyId: family.id } },
  });

  if (existing) {
    throw new Error("Anda sudah menjadi anggota keluarga ini");
  }

  await prisma.familyMember.create({
    data: {
      profileId: user.id,
      familyId: family.id,
    },
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/families/${family.id}`);
}

export async function removeMember(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const memberId = formData.get("memberId") as string;
  const familyId = formData.get("familyId") as string;

  const member = await prisma.familyMember.findUnique({
    where: { id: memberId },
  });

  if (!member) throw new Error("Anggota tidak ditemukan");

  const currentUserMember = await prisma.familyMember.findUnique({
    where: {
      profileId_familyId: { profileId: user.id, familyId },
    },
  });

  if (currentUserMember?.role !== "ADMIN") {
    throw new Error("Hanya admin yang dapat menghapus anggota");
  }

  if (member.profileId === user.id) {
    throw new Error("Admin tidak bisa menghapus diri sendiri");
  }

  await prisma.familyMember.delete({ where: { id: memberId } });

  revalidatePath(`/dashboard/families/${familyId}`);
}

export async function updateMemberRole(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const memberId = formData.get("memberId") as string;
  const familyId = formData.get("familyId") as string;
  const newRole = formData.get("role") as string;

  const currentUserMember = await prisma.familyMember.findUnique({
    where: { profileId_familyId: { profileId: user.id, familyId } },
  });
  if (currentUserMember?.role !== "ADMIN") {
    throw new Error("Hanya admin yang dapat mengubah role anggota");
  }

  const target = await prisma.familyMember.findUnique({ where: { id: memberId } });
  if (!target) throw new Error("Anggota tidak ditemukan");
  if (target.profileId === user.id) {
    throw new Error("Admin tidak bisa mengubah role diri sendiri di sini");
  }

  await prisma.familyMember.update({
    where: { id: memberId },
    data: { role: newRole as never },
  });

  revalidatePath(`/dashboard/families/${familyId}`);
}
