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
