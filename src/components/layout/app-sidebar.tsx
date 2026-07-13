"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  TrendingUp,
  TrendingDown,
  Tags,
  Wallet,
  Users,
  Settings,
  LayoutDashboard,
  LogOut,
  ArrowLeftRight,
  Receipt,
  PiggyBank,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/client"

const navGroups = [
  {
    label: "Umum",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Transaksi",
    items: [
      { title: "Pemasukan", url: "/dashboard/income", icon: TrendingUp },
      { title: "Pengeluaran", url: "/dashboard/expense", icon: TrendingDown },
      { title: "Transfer", url: "/dashboard/transfer", icon: ArrowLeftRight },
    ],
  },
  {
    label: "Perencanaan",
    items: [
      { title: "Tagihan", url: "/dashboard/bills", icon: Receipt },
      { title: "Tabungan", url: "/dashboard/savings", icon: PiggyBank },
    ],
  },
  {
    label: "Master Data",
    items: [
      { title: "Kategori", url: "/dashboard/categories", icon: Tags },
      { title: "Dompet", url: "/dashboard/wallets", icon: Wallet },
    ],
  },
  {
    label: "Lainnya",
    items: [
      { title: "Keluarga", url: "/dashboard/families/", icon: Users },
      { title: "Pengaturan", url: "/dashboard/settings", icon: Settings },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard">
                <Image src="/logo-sikaraman.png" alt="SIKARA" width={24} height={24} className="size-6" />
                <span className="font-semibold text-base">SIKARA</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    item.url === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.url)
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} disabled={loggingOut}>
              <LogOut />
              <span>{loggingOut ? "Keluar..." : "Keluar"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="p-2 text-center text-xs text-muted-foreground">
          SIKARA v0.1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}