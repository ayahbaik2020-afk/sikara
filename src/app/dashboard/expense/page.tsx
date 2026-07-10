import { prisma } from "@/lib/prisma";
import { getCurrentFamilyMember } from "@/lib/helpers/family";
import {
  createTransaction,
  deleteTransaction,
} from "@/features/transaction/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { NoFamilyPrompt } from "@/components/layout/no-family-prompt";

export default async function ExpensePage() {
  const member = await getCurrentFamilyMember();
  if (!member) return <NoFamilyPrompt />;

  const [wallets, categories, transactions] = await Promise.all([
    prisma.wallet.findMany({
      where: { familyId: member.familyId, isActive: true },
    }),
    prisma.category.findMany({
      where: { familyId: member.familyId, type: "EXPENSE", isActive: true },
    }),
    prisma.transaction.findMany({
      where: { familyId: member.familyId, type: "EXPENSE" },
      include: { wallet: true, category: true },
      orderBy: { transactionDate: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 pt-6">
      <h1 className="text-2xl font-bold text-red-600">Pengeluaran</h1>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Pengeluaran</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createTransaction} className="space-y-3">
            <input type="hidden" name="type" value="EXPENSE" />
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                name="walletId"
                required
                className="flex h-8 w-full items-center rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Pilih Dompet</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} (Rp {Number(w.balance).toLocaleString("id-ID")})
                  </option>
                ))}
              </select>
              <select
                name="categoryId"
                required
                className="flex h-8 w-full items-center rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Pilih Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Input
                name="amount"
                type="number"
                step="0.01"
                required
                placeholder="Nominal"
              />
              <Input
                name="transactionDate"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </div>
            <Input
              name="description"
              placeholder="Keterangan (opsional)"
            />
            <Button type="submit" variant="default">
              <Plus className="size-4" />
              Simpan
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {transactions.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Belum ada pengeluaran.
          </p>
        ) : (
          transactions.map((t) => (
            <Card key={t.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-red-600">
                      Rp {Number(t.amount).toLocaleString("id-ID")}
                    </span>
                    <Badge variant="outline">{t.category?.name}</Badge>
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {t.wallet.name}
                    {t.description ? ` — ${t.description}` : ""}
                    {" — "}
                    {new Date(t.transactionDate).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <form action={deleteTransaction}>
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="type" value="EXPENSE" />
                  <Button
                    type="submit"
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="size-4" />
                    Hapus
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
