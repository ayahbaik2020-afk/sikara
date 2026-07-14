import { prisma } from "@/lib/prisma";
import { getCurrentFamilyMember } from "@/lib/helpers/family";
import {
  createInvestment,
  deleteInvestment,
  updateInvestmentValue,
} from "@/features/investment/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LineChart, Trash2, Plus } from "lucide-react";
import { NoFamilyPrompt } from "@/components/layout/no-family-prompt";
import { AccessDenied } from "@/components/layout/access-denied";
import { getAccess } from "@/lib/helpers/access";

const typeLabels: Record<string, string> = {
  STOCK: "Saham",
  MUTUAL_FUND: "Reksadana",
  GOLD: "Emas",
  CRYPTO: "Kripto",
  OTHER: "Lainnya",
};

export default async function InvestmentsPage() {
  const member = await getCurrentFamilyMember();
  if (!member) return <NoFamilyPrompt />;
  const access = getAccess("investments", member.role);
  if (access === "none") return <AccessDenied moduleName="Investasi" />;
  const canEdit = access === "full";

  const investments = await prisma.investment.findMany({
    where: { familyId: member.familyId },
    orderBy: { createdAt: "desc" },
  });

  const totalInvested = investments.reduce((s, i) => s + Number(i.amountInvested), 0);
  const totalCurrent = investments.reduce((s, i) => s + Number(i.currentValue), 0);

  const totalGain = totalCurrent - totalInvested;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Investasi</h1>
        <p className="text-sm text-muted-foreground">
          Total: <span className="font-semibold text-foreground">Rp {totalCurrent.toLocaleString("id-ID")}</span>{" "}
          <span className={totalGain >= 0 ? "text-green-600" : "text-red-500"}>
            ({totalGain >= 0 ? "+" : ""}Rp {totalGain.toLocaleString("id-ID")})
          </span>
        </p>
      </div>

      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>Tambah Investasi</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createInvestment} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input name="name" placeholder="Nama (mis. BBCA, Reksadana Pasar Uang)" required />
                <select
                  name="type"
                  defaultValue="OTHER"
                  className="flex h-8 w-full items-center rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
                >
                  <option value="STOCK">Saham</option>
                  <option value="MUTUAL_FUND">Reksadana</option>
                  <option value="GOLD">Emas</option>
                  <option value="CRYPTO">Kripto</option>
                  <option value="OTHER">Lainnya</option>
                </select>
                <Input name="amountInvested" type="number" step="0.01" min="0" required placeholder="Modal awal" />
                <Input name="currentValue" type="number" step="0.01" min="0" required placeholder="Nilai sekarang" />
              </div>
              <Input name="note" placeholder="Catatan (opsional)" />
              <Button type="submit">
                <Plus className="size-4" />
                Simpan
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {investments.length === 0 ? (
          <p className="text-muted-foreground text-sm">Belum ada investasi tercatat.</p>
        ) : (
          investments.map((inv) => {
            const gain = Number(inv.currentValue) - Number(inv.amountInvested);
            const gainPct = Number(inv.amountInvested) > 0
              ? (gain / Number(inv.amountInvested)) * 100
              : 0;
            return (
              <Card key={inv.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 font-semibold">
                      <LineChart className="size-4 text-muted-foreground" />
                      {inv.name}
                      <Badge variant="outline">{typeLabels[inv.type]}</Badge>
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      Modal Rp {Number(inv.amountInvested).toLocaleString("id-ID")} → Rp{" "}
                      {Number(inv.currentValue).toLocaleString("id-ID")}{" "}
                      <span className={gain >= 0 ? "text-green-600" : "text-red-500"}>
                        ({gain >= 0 ? "+" : ""}{gainPct.toFixed(1)}%)
                      </span>
                      {inv.note ? ` — ${inv.note}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {canEdit && (
                      <>
                        <form action={updateInvestmentValue} className="flex items-center gap-2">
                          <input type="hidden" name="id" value={inv.id} />
                          <Input
                            name="currentValue"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={Number(inv.currentValue)}
                            className="h-8 w-28"
                          />
                          <Button type="submit" size="sm" variant="outline">
                            Update
                          </Button>
                        </form>
                        <form action={deleteInvestment}>
                          <input type="hidden" name="id" value={inv.id} />
                          <Button type="submit" variant="destructive" size="sm">
                            <Trash2 className="size-4" />
                          </Button>
                        </form>
                      </>
                    )}
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
