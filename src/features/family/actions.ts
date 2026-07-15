"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";

async function requireSuperAdmin() {
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
}

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
  await requireSuperAdmin();

  const name = formData.get("name") as string;
  if (!name || name.trim().length === 0) {
    throw new Error("Nama keluarga wajib diisi");
  }

  await prisma.family.create({ data: { name: name.trim() } });

  revalidatePath("/dashboard/super");
}

/**
 * Super Admin membuat akun Family Admin PERTAMA untuk sebuah family yang
 * belum punya admin. Ini menutup gap: sebelumnya tidak ada satu pun cara
 * di aplikasi untuk membuat akun baru (harus manual lewat SQL/Supabase
 * Auth). Password sementara wajib diganti sendiri oleh Family Admin
 * setelah login pertama (belum ada halaman ganti password — dicatat
 * sebagai TODO terpisah).
 */
export async function assignFamilyAdmin(familyId: string, formData: FormData) {
  await requireSuperAdmin();

  const username = (formData.get("username") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const password = formData.get("password") as string;
  const relationship = (formData.get("relationship") as string) || "AYAH";

  if (!username || !name || !password) {
    throw new Error("Username, nama, dan password wajib diisi");
  }
  if (password.length < 8) {
    throw new Error("Password minimal 8 karakter");
  }

  const family = await prisma.family.findUnique({
    where: { id: familyId },
    include: { members: { where: { systemRole: "FAMILY_ADMIN" } } },
  });
  if (!family) throw new Error("Family tidak ditemukan");
  if (family.members.length > 0) {
    throw new Error("Family ini sudah punya Family Admin aktif");
  }

  const existingUsername = await prisma.profile.findUnique({ where: { username } });
  if (existingUsername) throw new Error("Username sudah dipakai, pilih yang lain");

  // Username tidak dipakai untuk email asli, jadi generate email placeholder
  // internal yang unik (aplikasi ini login pakai username, bukan email).
  const email = `${username}@sikara.internal`;

  const supabaseAdmin = createAdminClient();
  const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !created.user) {
    throw new Error(`Gagal membuat akun: ${error?.message ?? "unknown error"}`);
  }

  try {
    await prisma.$transaction([
      prisma.profile.create({
        data: {
          id: created.user.id,
          email,
          username,
          name,
          role: "MEMBER", // role global biasa; hak akses FAMILY_ADMIN ada di FamilyMember
          status: "ACTIVE",
        },
      }),
      prisma.familyMember.create({
        data: {
          profileId: created.user.id,
          familyId,
          systemRole: "FAMILY_ADMIN",
          relationship: relationship as "AYAH" | "IBU" | "ANAK",
        },
      }),
    ]);
  } catch (dbError) {
    // Rollback manual: kalau insert ke Prisma gagal, jangan tinggalkan
    // user Supabase Auth yatim tanpa profile.
    await supabaseAdmin.auth.admin.deleteUser(created.user.id);
    throw dbError;
  }

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

/**
 * Family Admin membuat akun Member (Ibu/Anak) baru untuk family miliknya.
 * Sejalan dengan aturan login project ini (username+password, TANPA
 * invite/register), jadi ini pengganti alur "Kode Undangan" lama yang
 * mengharuskan orang punya akun duluan sebelum bisa join.
 */
export async function createFamilyMember(familyId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const requesterMember = await prisma.familyMember.findUnique({
    where: { profileId_familyId: { profileId: user.id, familyId } },
  });
  if (requesterMember?.systemRole !== "FAMILY_ADMIN") {
    throw new Error("Hanya Family Admin yang dapat menambah anggota");
  }

  const username = (formData.get("username") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const password = formData.get("password") as string;
  const relationship = (formData.get("relationship") as string) || "ANAK";

  if (!username || !name || !password) {
    throw new Error("Username, nama, dan password wajib diisi");
  }
  if (password.length < 8) {
    throw new Error("Password minimal 8 karakter");
  }

  const existingUsername = await prisma.profile.findUnique({ where: { username } });
  if (existingUsername) throw new Error("Username sudah dipakai, pilih yang lain");

  const email = `${username}@sikara.internal`;

  const supabaseAdmin = createAdminClient();
  const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !created.user) {
    throw new Error(`Gagal membuat akun: ${error?.message ?? "unknown error"}`);
  }

  try {
    await prisma.$transaction([
      prisma.profile.create({
        data: {
          id: created.user.id,
          email,
          username,
          name,
          role: "MEMBER",
          status: "ACTIVE",
        },
      }),
      prisma.familyMember.create({
        data: {
          profileId: created.user.id,
          familyId,
          systemRole: "MEMBER",
          relationship: relationship as "AYAH" | "IBU" | "ANAK",
        },
      }),
    ]);
  } catch (dbError) {
    await supabaseAdmin.auth.admin.deleteUser(created.user.id);
    throw dbError;
  }

  revalidatePath(`/dashboard/families/${familyId}`);
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
