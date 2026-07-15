import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentFamilyMember() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const member = await prisma.familyMember.findFirst({
    where: { profileId: user.id },
    include: { family: true, profile: true },
    orderBy: { joinedAt: "asc" },
  });

  return member;
}

export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return prisma.profile.findUnique({ where: { id: user.id } });
}

/**
 * Sama seperti memanggil getCurrentFamilyMember() + getCurrentProfile()
 * bersamaan, tapi hanya membuat SATU client Supabase & SATU pemanggilan
 * auth.getUser(). Dipakai di dashboard/layout.tsx supaya tidak ada dua
 * pemanggilan cookie-handling Supabase yang berjalan bersamaan dalam satu
 * Server Component (berpotensi menyebabkan server-side exception di
 * runtime Next.js/Vercel).
 */
export async function getCurrentMemberAndProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { member: null, profile: null };

  const [member, profile] = await Promise.all([
    prisma.familyMember.findFirst({
      where: { profileId: user.id },
      include: { family: true, profile: true },
      orderBy: { joinedAt: "asc" },
    }),
    prisma.profile.findUnique({ where: { id: user.id } }),
  ]);

  return { member, profile };
}
