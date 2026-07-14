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
          systemRole: "FAMILY_ADMIN",
          relationship: "AYAH",
        },
      },
    },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

/**
 * Super Admin membuat Family baru TANPA otomatis menjadi anggotanya
 * (Super Admin mengelola lintas family, bukan berpartisipasi di
 * dalamnya). Family Admin untuk family ini ditunjuk belakangan lewat
 * halaman /dashboard/super (TODO: fitur assign Family Admin — lihat
 * laporan refactor).
 */
export async function createFamilyAsSuperAdmin(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const requester = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (requester?.role !== "SUPER_ADMIN") {
    throw new Error("Hanya Super Admin yang dapat menggunakan aksi ini");
  }

  const name = formData.get("name") as string;
  if (!name || name.trim().length === 0) {
    throw new Error("Nama keluarga wajib diisi");
  }

  await prisma.family.create({ data: { name: name.trim() } });

  revalidatePath("/dashboard/super");
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
      systemRole: "MEMBER",
      relationship: "ANAK",
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

  if (currentUserMember?.systemRole !== "FAMILY_ADMIN") {
    throw new Error("Hanya Family Admin yang dapat menghapus anggota");
  }

  if (member.profileId === user.id) {
    throw new Error("Admin tidak bisa menghapus diri sendiri");
  }

  await prisma.familyMember.delete({ where: { id: memberId } });

  revalidatePath(`/dashboard/families/${familyId}`);
}

/**
 * Admin mengubah HUBUNGAN KELUARGA (Ayah/Ibu/Anak) anggota — bukan system
 * role. Perpindahan Family Admin sendiri adalah wewenang Super Admin
 * (Tahap E, belum diimplementasi).
 */
export async function updateMemberRelationship(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const memberId = formData.get("memberId") as string;
  const familyId = formData.get("familyId") as string;
  const newRelationship = formData.get("relationship") as string;

  const currentUserMember = await prisma.familyMember.findUnique({
    where: { profileId_familyId: { profileId: user.id, familyId } },
  });
  if (currentUserMember?.systemRole !== "FAMILY_ADMIN") {
    throw new Error("Hanya Family Admin yang dapat mengubah hubungan keluarga");
  }

  const target = await prisma.familyMember.findUnique({ where: { id: memberId } });
  if (!target) throw new Error("Anggota tidak ditemukan");

  if (newRelationship === "AYAH" || newRelationship === "IBU") {
    const clash = await prisma.familyMember.findFirst({
      where: {
        familyId,
        relationship: newRelationship as never,
        id: { not: memberId },
      },
    });
    if (clash) {
      throw new Error(
        `Sudah ada anggota dengan hubungan "${newRelationship === "AYAH" ? "Ayah" : "Ibu"}" di keluarga ini. Maksimal 1 Ayah dan 1 Ibu per keluarga.`
      );
    }
  }

  await prisma.familyMember.update({
    where: { id: memberId },
    data: { relationship: newRelationship as never },
  });

  revalidatePath(`/dashboard/families/${familyId}`);
}
