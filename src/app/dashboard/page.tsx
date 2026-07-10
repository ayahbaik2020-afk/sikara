import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { FamilyMember, Wallet, Transaction } from "@/generated/prisma/client";
import { createFamily, joinFamily } from "@/features/family/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Wallet as WalletIcon,
  Tags,
  Users,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Banknote,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let memberships: (FamilyMember & { family: { id: string; name: string } })[] = [];
  let wallets: Wallet[] = [];
  let totalBalance = 0;
  let walletCount = 0;
  let totalIncome = 0;
  let totalExpense = 0;
  let recentTransactions: (Transaction & { wallet: { name: string }; category: { name: string } })[] = [];

  try {
    memberships = await prisma.familyMember.findMany({
      where: { profileId: user.id },
      include: { family: { select: { id: true, name: true } } },
    }) as unknown as typeof memberships;

    const familyIds = memberships.map((m) => m.familyId);

    if (familyIds.length > 0) {
      const [walletAgg, wCount, incomeAgg, expenseAgg, txs] =
        await Promise.all([
          prisma.wallet.aggregate({
            _sum: { balance: true },
            where: { familyId: { in: familyIds }, isActive: true },
          }),
          prisma.wallet.count({
            where: { familyId: { in: familyIds }, isActive: true },
          }),
          prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { familyId: { in: familyIds }, type: "INCOME" },
          }),
          prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { familyId: { in: familyIds }, type: "EXPENSE" },
          }),
          prisma.transaction.findMany({
            where: { familyId: { in: familyIds } },
            include: { wallet: { select: { name: true } }, category: { select: { name: true } } },
            orderBy: { transactionDate: "desc" },
            take: 5,
          }),
        ]);

      totalBalance = Number(walletAgg._sum.balance || 0);
      totalIncome = Number(incomeAgg._sum.amount || 0);
      totalExpense = Number(expenseAgg._sum.amount || 0);
      walletCount = wCount;
      recentTransactions = txs as unknown as typeof recentTransactions;

      wallets = await prisma.wallet.findMany({
        where: { familyId: { in: familyIds }, isActive: true },
        orderBy: { balance: "desc" },
      });
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? `${e.message}\n\n${e.stack}` : String(e);
    const dbUrl = process.env.DATABASE_URL || "(TIDAK TERDEFINISI)";
    const nodeEnv = process.env.NODE_ENV || "(tidak ada)";
    return (
      <div className="p-8">
        <h2 className="text-xl font-bold mb-4">Error Dashboard</h2>
        <p className="mb-2 text-sm text-muted-foreground">DATABASE_URL: {dbUrl}</p>
        <p className="mb-2 text-sm text-muted-foreground">NODE_ENV: {nodeEnv}</p>
        <pre className="bg-red-50 dark:bg-red-950 text-red-600 p-4 rounded-lg text-sm whitespace-pre-wrap">
          {message}
        </pre>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Selamat datang, {user.user_metadata?.name || user.email}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Saldo</CardTitle>
            <Banknote className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Rp {totalBalance.toLocaleString("id-ID")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pemasukan</CardTitle>
            <TrendingUp className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">Rp {totalIncome.toLocaleString("id-ID")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pengeluaran</CardTitle>
            <TrendingDown className="size-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">Rp {totalExpense.toLocaleString("id-ID")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dompet Aktif</CardTitle>
            <WalletIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{walletCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/income" className="block">
          <Card className="transition-colors hover:bg-accent/50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-9 items-center justify-center rounded-lg bg-green-600/10">
                <TrendingUp className="size-5 text-green-600" />
              </div>
              <span className="text-sm font-medium">Catat Pemasukan</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/expense" className="block">
          <Card className="transition-colors hover:bg-accent/50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-9 items-center justify-center rounded-lg bg-red-600/10">
                <TrendingDown className="size-5 text-red-600" />
              </div>
              <span className="text-sm font-medium">Catat Pengeluaran</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/categories" className="block">
          <Card className="transition-colors hover:bg-accent/50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <Tags className="size-5 text-primary" />
              </div>
              <span className="text-sm font-medium">Kelola Kategori</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/wallets" className="block">
          <Card className="transition-colors hover:bg-accent/50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <WalletIcon className="size-5 text-primary" />
              </div>
              <span className="text-sm font-medium">Kelola Dompet</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ringkasan Dompet</CardTitle>
            <Link href="/dashboard/wallets" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              Lihat semua <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {wallets.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada dompet. Buat dompet terlebih dahulu.</p>
            ) : (
              <div className="space-y-3">
                {wallets.map((w) => {
                  const typeLabel = { CASH: "Tunai", BANK: "Bank", E_WALLET: "E-Wallet" }[w.type];
                  return (
                    <div key={w.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="inline-block size-3 rounded-full" style={{ backgroundColor: w.color }} />
                        <div>
                          <p className="text-sm font-medium">{w.name}</p>
                          <p className="text-xs text-muted-foreground">{typeLabel}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold">Rp {Number(w.balance).toLocaleString("id-ID")}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {recentTransactions.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Transaksi Terbaru</CardTitle>
              <div className="flex gap-3">
                <Link href="/dashboard/income" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                  Pemasukan <ArrowRight className="size-3" />
                </Link>
                <Link href="/dashboard/expense" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                  Pengeluaran <ArrowRight className="size-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`inline-block size-2 rounded-full ${t.type === "INCOME" ? "bg-green-500" : "bg-red-500"}`} />
                      <div>
                        <p className="text-sm font-medium">
                          {t.type === "INCOME" ? "Pemasukan" : "Pengeluaran"} — Rp {Number(t.amount).toLocaleString("id-ID")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.category?.name} · {t.wallet.name}{t.description ? ` · ${t.description}` : ""}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(t.transactionDate).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Keluarga Saya</CardTitle>
          <Link href="/dashboard/families" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            Lihat semua <ArrowRight className="size-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {memberships.length === 0 ? (
            <div className="py-6 text-center">
              <Users className="mx-auto mb-2 size-8 text-muted-foreground" />
              <p className="mb-4 text-sm text-muted-foreground">Belum bergabung dengan keluarga mana pun.</p>
              <div className="flex justify-center gap-3">
                <details className="group">
                  <summary className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                    <Plus className="size-4" /> Buat Keluarga
                  </summary>
                  <div className="absolute z-10 mt-2 rounded-lg border bg-card p-3 shadow-lg">
                    <form action={createFamily} className="flex gap-2">
                      <Input name="name" placeholder="Nama keluarga" required className="h-9" />
                      <Button type="submit" size="sm">Buat</Button>
                    </form>
                  </div>
                </details>
                <details className="group">
                  <summary className="inline-flex cursor-pointer items-center gap-1 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent">
                    Gabung Keluarga
                  </summary>
                  <div className="absolute z-10 mt-2 rounded-lg border bg-card p-3 shadow-lg">
                    <form action={joinFamily} className="flex gap-2">
                      <Input name="inviteCode" placeholder="Kode undangan" required className="h-9" />
                      <Button type="submit" variant="outline" size="sm">Gabung</Button>
                    </form>
                  </div>
                </details>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {memberships.map((m) => (
                <Link key={m.id} href={`/dashboard/families/${m.family.id}`} className="block">
                  <Card className="transition-colors hover:bg-accent/50">
                    <CardContent className="flex items-center justify-between p-4">
                      <p className="font-medium">{m.family.name}</p>
                      <span className="text-xs text-muted-foreground">{m.role === "ADMIN" ? "Admin" : "Anggota"}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}