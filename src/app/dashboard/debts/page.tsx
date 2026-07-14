import { prisma } from "@/lib/prisma";
import { getCurrentFamilyMember } from "@/lib/helpers/family";
import { createDebt, deleteDebt, payDebt } from "@/features/debt/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HandCoins, Trash2, Plus } from "lucide-react";
import { NoFamilyPrompt } from "@/components/layout/no-family-prompt";
import { AccessDenied } from "@/components/layout/access-denied";
import { getAccess } from "@/lib/helpers/access";

export default async function DebtsPage() {
  const member = await getCurrentFamilyMember();
  if (!member) return <NoFamilyPrompt />;
  if (getAccess("debts", member.role) === "none") {
    return <AccessDenied moduleName="Hutang" />;
  }

  const [wallets, debts] = await Promise.all([
    prisma.wallet.findMany({
      where: { familyId: member.familyId, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.debt.findMany({
      where: { familyId: member.familyId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalOutstanding = debts.reduce(
    (s, d) => s + (Number(d.amount) - Number(d.paidAmount)),
    0
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hutang</h1>
        <p className="text-sm text-muted-foreground">
          Sisa: <span className="font-semibold text-red-500">Rp {totalOutstanding.toLocaleString("id-ID")}</span>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Hutang</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createDebt} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input name="name" placeholder="Nama / pemberi pinjaman" required />
              <Input name="amount" type="number" step="0.01" min="0.01" required placeholder="Nominal total" />
              <Input name="dueDate" type="date" placeholder="Jatuh tempo (opsional)" />
            </div>
            <Input name="note" placeholder="Catatan (opsional)" />
            <Button type="submit">
              <Plus className="size-4" />
              Simpan
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {debts.length === 0 ? (
          <p className="text-muted-foreground text-sm">Belum ada hutang tercatat.</p>
        ) : (
          debts.map((d) => {
            const remaining = Number(d.amount) - Number(d.paidAmount);
            const isDone = remaining <= 0;
            return (
              <Card key={d.id}>
                <CardContent className="space-y-2 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-semibold">
                      <HandCoins className="size-4 text-muted-foreground" />
                      {d.name}
                      <Badge variant={isDone ? "secondary" : "destructive"}>
                        {isDone ? "Lunas" : "Belum Lunas"}
                      </Badge>
                    </div>
                    <form action={deleteDebt}>
                      <input type="hidden" name="id" value={d.id} />
                      <Button type="submit" variant="destructive" size="sm">
                        <Trash2 className="size-4" />
                      </Button>
                    </form>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Terbayar Rp {Number(d.paidAmount).toLocaleString("id-ID")} / Rp{" "}
                    {Number(d.amount).toLocaleString("id-ID")}
                    {d.dueDate ? ` — jatuh tempo ${new Date(d.dueDate).toLocaleDateString("id-ID")}` : ""}
                    {d.note ? ` — ${d.note}` : ""}
                  </p>
                  {!isDone && wallets.length > 0 && (
                    <form action={payDebt} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="id" value={d.id} />
                      <select name="walletId" required className="flex h-8 items-center rounded-lg border border-input bg-transparent px-2 py-1 text-xs">
                        {wallets.map((w) => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
                      <Input name="amount" type="number" step="0.01" min="0.01" required placeholder="Nominal bayar" className="h-8 w-32" />
                      <Button type="submit" size="sm">Bayar</Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
