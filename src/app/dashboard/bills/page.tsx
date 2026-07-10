import { prisma } from "@/lib/prisma";
import { getCurrentFamilyMember } from "@/lib/helpers/family";
import { createBill, deleteBill, payBill } from "@/features/bill/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, CheckCircle2, Receipt } from "lucide-react";
import { NoFamilyPrompt } from "@/components/layout/no-family-prompt";

const recurrenceLabels: Record<string, string> = {
  ONCE: "Sekali",
  WEEKLY: "Mingguan",
  MONTHLY: "Bulanan",
  YEARLY: "Tahunan",
};

export default async function BillsPage() {
  const member = await getCurrentFamilyMember();
  if (!member) return <NoFamilyPrompt />;

  const [wallets, bills] = await Promise.all([
    prisma.wallet.findMany({
      where: { familyId: member.familyId, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.bill.findMany({
      where: { familyId: member.familyId },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    }),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pt-6">
      <h1 className="text-2xl font-bold">Tagihan</h1>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Tagihan</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createBill} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input name="name" placeholder="Nama tagihan" required />
              <Input
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="Nominal"
              />
              <Input name="dueDate" type="date" required />
              <select
                name="recurrence"
                defaultValue="ONCE"
                className="flex h-8 w-full items-center rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="ONCE">Sekali</option>
                <option value="WEEKLY">Mingguan</option>
                <option value="MONTHLY">Bulanan</option>
                <option value="YEARLY">Tahunan</option>
              </select>
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
        {bills.length === 0 ? (
          <p className="text-muted-foreground text-sm">Belum ada tagihan.</p>
        ) : (
          bills.map((b) => {
            const due = new Date(b.dueDate);
            due.setHours(0, 0, 0, 0);
            const isOverdue = b.status === "UNPAID" && due < today;
            return (
              <Card key={b.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="flex-1 min-w-[180px]">
                    <div className="flex items-center gap-2">
                      <Receipt className="size-4 text-muted-foreground" />
                      <span className="font-semibold">{b.name}</span>
                      <Badge variant={b.status === "PAID" ? "secondary" : isOverdue ? "destructive" : "outline"}>
                        {b.status === "PAID" ? "Lunas" : isOverdue ? "Terlambat" : "Belum Bayar"}
                      </Badge>
                      <Badge variant="outline">{recurrenceLabels[b.recurrence]}</Badge>
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      Rp {Number(b.amount).toLocaleString("id-ID")} — jatuh tempo{" "}
                      {due.toLocaleDateString("id-ID")}
                      {b.note ? ` — ${b.note}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {b.status === "UNPAID" && wallets.length > 0 && (
                      <form action={payBill} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={b.id} />
                        <select
                          name="walletId"
                          required
                          className="flex h-8 items-center rounded-lg border border-input bg-transparent px-2 py-1 text-xs"
                        >
                          {wallets.map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.name}
                            </option>
                          ))}
                        </select>
                        <Button type="submit" size="sm" variant="default">
                          <CheckCircle2 className="size-4" />
                          Bayar
                        </Button>
                      </form>
                    )}
                    <form action={deleteBill}>
                      <input type="hidden" name="id" value={b.id} />
                      <Button type="submit" variant="destructive" size="sm">
                        <Trash2 className="size-4" />
                        Hapus
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
