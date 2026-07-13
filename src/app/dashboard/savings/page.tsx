import { prisma } from "@/lib/prisma";
import { getCurrentFamilyMember } from "@/lib/helpers/family";
import {
  createSavingsGoal,
  deleteSavingsGoal,
  addContribution,
} from "@/features/savings/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PiggyBank, Plus, Trash2, Target } from "lucide-react";
import { NoFamilyPrompt } from "@/components/layout/no-family-prompt";

export default async function SavingsPage() {
  const member = await getCurrentFamilyMember();
  if (!member) return <NoFamilyPrompt />;

  const [wallets, goals] = await Promise.all([
    prisma.wallet.findMany({
      where: { familyId: member.familyId, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.savingsGoal.findMany({
      where: { familyId: member.familyId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pt-6">
      <h1 className="text-2xl font-bold">Tabungan & Target Keuangan</h1>

      <Card>
        <CardHeader>
          <CardTitle>Buat Tabungan / Target Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createSavingsGoal} className="space-y-3">
            <Input name="name" placeholder="Nama (mis. Dana Darurat, Liburan)" required />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                name="targetAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Target nominal (opsional)"
              />
              <Input name="targetDate" type="date" placeholder="Target tanggal (opsional)" />
            </div>
            <Input name="note" placeholder="Catatan (opsional)" />
            <Button type="submit">
              <Plus className="size-4" />
              Buat
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {goals.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Belum ada tabungan atau target keuangan.
          </p>
        ) : (
          goals.map((g) => {
            const current = Number(g.currentAmount);
            const target = g.targetAmount ? Number(g.targetAmount) : null;
            const progress = target ? Math.min(100, (current / target) * 100) : null;
            const isDone = target !== null && current >= target;
            return (
              <Card key={g.id}>
                <CardContent className="space-y-3 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold">
                      {target ? (
                        <Target className="size-4 text-muted-foreground" />
                      ) : (
                        <PiggyBank className="size-4 text-muted-foreground" />
                      )}
                      {g.name}
                      {isDone && <Badge>Tercapai 🎉</Badge>}
                    </div>
                    <form action={deleteSavingsGoal}>
                      <input type="hidden" name="id" value={g.id} />
                      <Button type="submit" variant="destructive" size="sm">
                        <Trash2 className="size-4" />
                      </Button>
                    </form>
                  </div>

                  <div>
                    <p className="text-sm">
                      Rp {current.toLocaleString("id-ID")}
                      {target ? ` / Rp ${target.toLocaleString("id-ID")}` : ""}
                      {g.targetDate
                        ? ` — target ${new Date(g.targetDate).toLocaleDateString("id-ID")}`
                        : ""}
                    </p>
                    {progress !== null && (
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                    {g.note && (
                      <p className="text-muted-foreground mt-1 text-xs">{g.note}</p>
                    )}
                  </div>

                  {wallets.length > 0 && (
                    <form action={addContribution} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="id" value={g.id} />
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
                      <Input
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        placeholder="Nominal"
                        className="h-8 w-32"
                      />
                      <Button type="submit" size="sm">
                        <PiggyBank className="size-4" />
                        Tabung
                      </Button>
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
