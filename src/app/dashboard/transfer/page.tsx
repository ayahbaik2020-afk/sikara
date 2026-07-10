import { prisma } from "@/lib/prisma";
import { getCurrentFamilyMember } from "@/lib/helpers/family";
import { createTransfer, deleteTransfer } from "@/features/transfer/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeftRight, Trash2 } from "lucide-react";
import { NoFamilyPrompt } from "@/components/layout/no-family-prompt";

export default async function TransferPage() {
  const member = await getCurrentFamilyMember();
  if (!member) return <NoFamilyPrompt />;

  const [wallets, transactions] = await Promise.all([
    prisma.wallet.findMany({
      where: { familyId: member.familyId, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.transaction.findMany({
      where: { familyId: member.familyId, type: "TRANSFER" },
      include: { wallet: true },
      orderBy: { transactionDate: "desc" },
      take: 100,
    }),
  ]);

  // Group the two rows of each transfer pair into one entry (the "keluar" row
  // carries the description "Transfer ke ..." and the amount transferred).
  type Row = (typeof transactions)[number];
  const pairs = new Map<string, Row[]>();
  for (const t of transactions) {
    if (!t.transferPairId) continue;
    const arr = pairs.get(t.transferPairId) ?? [];
    arr.push(t);
    pairs.set(t.transferPairId, arr);
  }
  const transferList = Array.from(pairs.entries())
    .map(([pairId, rows]) => {
      const out = rows.find((r) => r.description?.startsWith("Transfer ke"));
      const inn = rows.find((r) => r.description?.startsWith("Transfer dari"));
      if (!out || !inn) return null;
      return { pairId, out, inn };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort(
      (a, b) =>
        new Date(b.out.transactionDate).getTime() -
        new Date(a.out.transactionDate).getTime()
    );

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pt-6">
      <h1 className="text-2xl font-bold">Transfer Antar Dompet</h1>

      <Card>
        <CardHeader>
          <CardTitle>Transfer Baru</CardTitle>
        </CardHeader>
        <CardContent>
          {wallets.length < 2 ? (
            <p className="text-muted-foreground text-sm">
              Minimal butuh 2 dompet aktif untuk melakukan transfer.
            </p>
          ) : (
            <form action={createTransfer} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  name="fromWalletId"
                  required
                  className="flex h-8 w-full items-center rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Dari Dompet</option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} (Rp {Number(w.balance).toLocaleString("id-ID")})
                    </option>
                  ))}
                </select>
                <select
                  name="toWalletId"
                  required
                  className="flex h-8 w-full items-center rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Ke Dompet</option>
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
                />
                <Input
                  name="transactionDate"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
              <Input name="description" placeholder="Keterangan (opsional)" />
              <Button type="submit" variant="default">
                <ArrowLeftRight className="size-4" />
                Transfer
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <div className="space-y-2">
        {transferList.length === 0 ? (
          <p className="text-muted-foreground text-sm">Belum ada transfer.</p>
        ) : (
          transferList.map(({ pairId, out, inn }) => (
            <Card key={pairId}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-semibold">
                    <span>{out.wallet.name}</span>
                    <ArrowLeftRight className="size-4 text-muted-foreground" />
                    <span>{inn.wallet.name}</span>
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    Rp {Number(out.amount).toLocaleString("id-ID")}
                    {out.description?.includes(":")
                      ? ` — ${out.description.split(": ")[1]}`
                      : ""}
                    {" — "}
                    {new Date(out.transactionDate).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <form action={deleteTransfer}>
                  <input type="hidden" name="transferPairId" value={pairId} />
                  <Button type="submit" variant="destructive" size="sm">
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
