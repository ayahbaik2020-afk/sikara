"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function login(_prev: unknown, formData: FormData) {
  const supabase = await createClient();

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const profile = await prisma.profile.findUnique({
    where: { username },
    select: { email: true },
  });

  if (!profile) {
    return { error: "Username tidak ditemukan" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}