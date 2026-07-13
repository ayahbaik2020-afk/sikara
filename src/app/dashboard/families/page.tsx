import { redirect } from "next/navigation";
import { getCurrentFamilyMember } from "@/lib/helpers/family";

// Index route: setiap user hanya tergabung dalam satu keluarga, jadi
// langsung arahkan ke halaman detail keluarganya. Ini memperbaiki 404
// yang muncul saat mengakses /dashboard/families tanpa ID.
export default async function FamiliesIndexPage() {
  const member = await getCurrentFamilyMember();
  if (!member) redirect("/login");
  redirect(`/dashboard/families/${member.familyId}`);
}
