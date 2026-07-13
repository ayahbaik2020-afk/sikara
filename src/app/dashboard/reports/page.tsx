import { prisma } from "@/lib/prisma";
import { getCurrentFamilyMember } from "@/lib/helpers/family";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NoFamilyPrompt } from "@/components/layout/no-family-prompt";
import { MonthlyBarChart, CategoryPieChart } from "./charts";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export default async function ReportsPage() {
  const member = await getCurrentFamilyMember();
  if (!member) return <NoFamilyPrompt />;

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [transactions6mo, expenseThisMonth] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        familyId: member.familyId,
        type: { in: ["INCOME", "EXPENSE"] },
        transactionDate: { gte: sixMonthsAgo },
      },
      select: { type: true, amount: true, transactionDate: true },
    }),
    prisma.transaction.findMany({
      where: {
        familyId: member.familyId,
        type: "EXPENSE",
        transactionDate: { gte: startOfThisMonth, lt: startOfNextMonth },
      },
      include: { category: { select: { name: true } } },
    }),
  ]);

  // Bucket transaksi 6 bulan terakhir per bulan
  const monthlyMap = new Map<string, { Pemasukan: number; Pengeluaran: number }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
    monthlyMap.set(key, { Pemasukan: 0, Pengeluaran: 0 });
  }
  for (const t of transactions6mo) {
    const d = new Date(t.transactionDate);
    const key = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
    const bucket = monthlyMap.get(key);
    if (!bucket) continue;
    if (t.type === "INCOME") bucket.Pemasukan += Number(t.amount);
    else bucket.Pengeluaran += Number(t.amount);
  }
  const monthlyData = Array.from(monthlyMap.entries()).map(([month, v]) => ({
    month,
    ...v,
  }));

  // Breakdown pengeluaran per kategori bulan ini
  const categoryMap = new Map<string, number>();
  for (const t of expenseThisMonth) {
    const name = t.category?.name || "Tanpa Kategori";
    categoryMap.set(name, (categoryMap.get(name) || 0) + Number(t.amount));
  }
  const categoryData = Array.from(categoryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const totalIncome6mo = monthlyData.reduce((s, m) => s + m.Pemasukan, 0);
  const totalExpense6mo = monthlyData.reduce((s, m) => s + m.Pengeluaran, 0);
  const netSelisih = totalIncome6mo - totalExpense6mo;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 pt-6">
      <h1 className="text-2xl font-bold">Laporan</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pemasukan (6 bulan)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-green-600">
              Rp {totalIncome6mo.toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pengeluaran (6 bulan)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-red-600">
              Rp {totalExpense6mo.toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Selisih (6 bulan)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-xl font-bold ${netSelisih >= 0 ? "text-green-600" : "text-red-600"}`}>
              {netSelisih >= 0 ? "+" : ""}Rp {netSelisih.toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pemasukan vs Pengeluaran (6 Bulan Terakhir)</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyBarChart data={monthlyData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pengeluaran per Kategori (Bulan Ini)</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryPieChart data={categoryData} />
        </CardContent>
      </Card>
    </div>
  );
}
