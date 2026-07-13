import { prisma } from "@/lib/prisma";
import { getCurrentFamilyMember } from "@/lib/helpers/family";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Bell } from "lucide-react";
import Link from "next/link";
import { NoFamilyPrompt } from "@/components/layout/no-family-prompt";

type Notif = {
  type: "warning" | "success" | "info";
  title: string;
  href: string;
};

export default async function NotificationsPage() {
  const member = await getCurrentFamilyMember();
  if (!member) return <NoFamilyPrompt />;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in7Days = new Date(today);
  in7Days.setDate(in7Days.getDate() + 7);

  const [overdueBills, upcomingBills, goals, overdueDebts, overdueReceivables] =
    await Promise.all([
      prisma.bill.findMany({
        where: { familyId: member.familyId, status: "UNPAID", dueDate: { lt: today } },
      }),
      prisma.bill.findMany({
        where: {
          familyId: member.familyId,
          status: "UNPAID",
          dueDate: { gte: today, lte: in7Days },
        },
      }),
      prisma.savingsGoal.findMany({
        where: { familyId: member.familyId, targetAmount: { not: null } },
      }),
      prisma.debt.findMany({
        where: { familyId: member.familyId, dueDate: { lt: today } },
      }),
      prisma.receivable.findMany({
        where: { familyId: member.familyId, dueDate: { lt: today } },
      }),
    ]);

  const notifs: Notif[] = [];

  for (const b of overdueBills) {
    notifs.push({
      type: "warning",
      title: `Tagihan "${b.name}" sudah lewat jatuh tempo (Rp ${Number(b.amount).toLocaleString("id-ID")})`,
      href: "/dashboard/bills",
    });
  }
  for (const b of upcomingBills) {
    notifs.push({
      type: "info",
      title: `Tagihan "${b.name}" jatuh tempo ${new Date(b.dueDate).toLocaleDateString("id-ID")}`,
      href: "/dashboard/bills",
    });
  }
  for (const g of goals) {
    if (g.targetAmount && Number(g.currentAmount) >= Number(g.targetAmount)) {
      notifs.push({
        type: "success",
        title: `Target "${g.name}" sudah tercapai! 🎉`,
        href: "/dashboard/savings",
      });
    }
  }
  for (const d of overdueDebts) {
    const remaining = Number(d.amount) - Number(d.paidAmount);
    if (remaining > 0) {
      notifs.push({
        type: "warning",
        title: `Hutang "${d.name}" sudah lewat jatuh tempo (sisa Rp ${remaining.toLocaleString("id-ID")})`,
        href: "/dashboard/debts",
      });
    }
  }
  for (const r of overdueReceivables) {
    const remaining = Number(r.amount) - Number(r.paidAmount);
    if (remaining > 0) {
      notifs.push({
        type: "info",
        title: `Piutang "${r.name}" sudah lewat jatuh tempo (sisa Rp ${remaining.toLocaleString("id-ID")})`,
        href: "/dashboard/receivables",
      });
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pt-6">
      <h1 className="text-2xl font-bold">Notifikasi</h1>

      {notifs.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground">
          <Bell className="mx-auto mb-2 size-8" />
          <p className="text-sm">Tidak ada hal yang perlu perhatian saat ini.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map((n, i) => (
            <Link key={i} href={n.href} className="block">
              <Card className="transition-colors hover:bg-accent/50">
                <CardContent className="flex items-center gap-3 py-3">
                  {n.type === "warning" && <AlertTriangle className="size-4 shrink-0 text-red-500" />}
                  {n.type === "success" && <CheckCircle2 className="size-4 shrink-0 text-green-600" />}
                  {n.type === "info" && <Bell className="size-4 shrink-0 text-blue-500" />}
                  <p className="text-sm">{n.title}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
