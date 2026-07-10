"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  TrendingUp,
  TrendingDown,
  Tags,
  Wallet,
  Users,
  Settings,
  LayoutDashboard,
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
      <SidebarFooter className="p-4 text-center text-xs text-muted-foreground">
        SIKARA v0.1.0
      </SidebarFooter>
    </Sidebar>
  )
}