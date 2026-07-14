import { prisma } from "@/lib/prisma";
import { getCurrentFamilyMember } from "@/lib/helpers/family";
import { createReceivable, deleteReceivable, receivePayment } from "@/features/receivable/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HandCoins, Trash2, Plus } from "lucide-react";
import { NoFamilyPrompt } from "@/components/layout/no-family-prompt";
import { AccessDenied } from "@/components/layout/access-denied";
import { getAccess } from "@/lib/helpers/access";

export default async function ReceivablesPage() {
  const member = await getCurrentFamilyMember();
  if (!member) return <NoFamilyPrompt />;
  if (getAccess("receivables", member.systemRole) === "none") {
    return <AccessDenied moduleName="Piutang" />;
  }

  const [wallets, receivables] = await Promise.all([
    prisma.wallet.findMany({
      where: { familyId: member.familyId, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.receivable.findMany({
      where: { familyId: member.familyId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalOutstanding = receivables.reduce(
    (s, r) => s + (Number(r.amount) - Number(r.paidAmount)),
    0
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Piutang</h1>
        <p className="text-sm text-muted-foreground">
          Belum diterima: <span className="font-semibold text-green-600">Rp {totalOutstanding.toLocaleString("id-ID")}</span>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Piutang</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createReceivable} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input name="name" placeholder="Nama peminjam" required />
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
        {receivables.length === 0 ? (
          <p className="text-muted-foreground text-sm">Belum ada piutang tercatat.</p>
        ) : (
          receivables.map((r) => {
            const remaining = Number(r.amount) - Number(r.paidAmount);
            const isDone = remaining <= 0;
            return (
              <Card key={r.id}>
                <CardContent className="space-y-2 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-semibold">
                      <HandCoins className="size-4 text-muted-foreground" />
                      {r.name}
                      <Badge variant={isDone ? "secondary" : "outline"}>
                        {isDone ? "Lunas" : "Belum Lunas"}
                      </Badge>
                    </div>
                    <form action={deleteReceivable}>
                      <input type="hidden" name="id" value={r.id} />
                      <Button type="submit" variant="destructive" size="sm">
                        <Trash2 className="size-4" />
                      </Button>
                    </form>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Diterima Rp {Number(r.paidAmount).toLocaleString("id-ID")} / Rp{" "}
                    {Number(r.amount).toLocaleString("id-ID")}
                    {r.dueDate ? ` — jatuh tempo ${new Date(r.dueDate).toLocaleDateString("id-ID")}` : ""}
                    {r.note ? ` — ${r.note}` : ""}
                  </p>
                  {!isDone && wallets.length > 0 && (
                    <form action={receivePayment} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="id" value={r.id} />
                      <select name="walletId" required className="flex h-8 items-center rounded-lg border border-input bg-transparent px-2 py-1 text-xs">
                        {wallets.map((w) => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
                      <Input name="amount" type="number" step="0.01" min="0.01" required placeholder="Nominal diterima" className="h-8 w-32" />
                      <Button type="submit" size="sm">Terima</Button>
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
