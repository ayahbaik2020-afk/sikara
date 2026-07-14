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
  Home,
  LineChart,
  HandCoins,
  BarChart3,
  Bell,
  History,
  DatabaseBackup,
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
import { getAccess } from "@/lib/helpers/access"

const navGroups = [
  {
    label: "Umum",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, module: "dashboard" },
      { title: "Notifikasi", url: "/dashboard/notifications", icon: Bell, module: "notifications" },
      { title: "Laporan", url: "/dashboard/reports", icon: BarChart3, module: "reports" },
    ],
  },
  {
    label: "Transaksi",
    items: [
      { title: "Pemasukan", url: "/dashboard/income", icon: TrendingUp, module: "income" },
      { title: "Pengeluaran", url: "/dashboard/expense", icon: TrendingDown, module: "expense" },
      { title: "Transfer", url: "/dashboard/transfer", icon: ArrowLeftRight, module: "transfer" },
    ],
  },
  {
    label: "Perencanaan",
    items: [
      { title: "Tagihan", url: "/dashboard/bills", icon: Receipt, module: "bills" },
      { title: "Tabungan", url: "/dashboard/savings", icon: PiggyBank, module: "savings" },
      { title: "Aset", url: "/dashboard/assets", icon: Home, module: "assets" },
      { title: "Investasi", url: "/dashboard/investments", icon: LineChart, module: "investments" },
      { title: "Hutang", url: "/dashboard/debts", icon: HandCoins, module: "debts" },
      { title: "Piutang", url: "/dashboard/receivables", icon: HandCoins, module: "receivables" },
    ],
  },
  {
    label: "Master Data",
    items: [
      { title: "Kategori", url: "/dashboard/categories", icon: Tags, module: "categories" },
      { title: "Dompet", url: "/dashboard/wallets", icon: Wallet, module: "wallets" },
    ],
  },
  {
    label: "Lainnya",
    items: [
      { title: "Keluarga", url: "/dashboard/families/", icon: Users, module: "families" },
      { title: "Audit Log", url: "/dashboard/audit-log", icon: History, module: "auditLog" },
      { title: "Backup & Restore", url: "/dashboard/backup", icon: DatabaseBackup, module: "backup" },
      { title: "Pengaturan", url: "/dashboard/settings", icon: Settings, module: "settings" },
    ],
  },
]

export function AppSidebar({
  role,
  ...props
}: React.ComponentProps<typeof Sidebar> & { role: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => getAccess(item.module as never, role) !== "none"),
    }))
    .filter((group) => group.items.length > 0)


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
        {visibleGroups.map((group) => (
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