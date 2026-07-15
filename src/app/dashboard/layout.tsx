import { cookies } from "next/headers"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { getCurrentMemberAndProfile } from "@/lib/helpers/family"
import { isSuperAdmin } from "@/lib/helpers/access"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"
  // Super Admin biasanya tidak punya FamilyMember (tidak ikut family manapun),
  // jadi role sidebar harus dicek dari dua sumber: role global (Profile.role)
  // untuk Super Admin, dan systemRole (FamilyMember) untuk menu modul keuangan.
  // Dipanggil lewat SATU helper (getCurrentMemberAndProfile) supaya tidak ada
  // dua pemanggilan Supabase auth/cookie berjalan bersamaan di Server Component.
  const { member, profile } = await getCurrentMemberAndProfile()
  const superAdmin = profile ? isSuperAdmin(profile.role) : false

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar role={member?.systemRole ?? "MEMBER"} superAdmin={superAdmin} />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear">
          <div className="flex w-full items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-2 h-4" />
          </div>
        </header>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}