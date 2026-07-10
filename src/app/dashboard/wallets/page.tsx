import { prisma } from "@/lib/prisma";
import { getCurrentFamilyMember } from "@/lib/helpers/family";
import { createWallet, deleteWallet } from "@/features/wallet/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Wallet } from "lucide-react";
import { NoFamilyPrompt } from "@/components/layout/no-family-prompt";

const typeLabels: Record<string, string> = {
  CASH: "Tunai",
  BANK: "Bank",
  E_WALLET: "E-Wallet",
};

const typeVariants: Record<string, "default" | "secondary" | "outline"> = {
  CASH: "default",
  BANK: "secondary",
  E_WALLET: "outline",
};

export default async function WalletsPage() {
  const member = await getCurrentFamilyMember();
  if (!member) return <NoFamilyPrompt />;

  const wallets = await prisma.wallet.findMany({
    where: { familyId: member.familyId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pt-6">
      <h1 className="text-2xl font-bold">Dompet</h1>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Dompet</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createWallet} className="flex flex-wrap gap-2">
            <Input
              name="name"
              placeholder="Nama dompet"
              required
              className="min-w-[160px] flex-1"
            />
            <select
              name="type"
              required
              className="flex h-8 min-w-[120px] items-center rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="CASH">Tunai</option>
              <option value="BANK">Bank</option>
              <option value="E_WALLET">E-Wallet</option>
            </select>
            <Input
              name="balance"
              type="number"
              step="0.01"
              defaultValue="0"
              placeholder="Saldo awal"
              className="w-28"
            />
            <Button type="submit">
              <Plus className="size-4" />
              Tambah
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {wallets.length === 0 && (
          <p className="text-muted-foreground col-span-full text-sm">
            Belum ada dompet.
          </p>
        )}
        {wallets.map((w) => (
          <Card key={w.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: w.color }}
                  />
                  {w.name}
                </CardTitle>
                <Badge variant={typeVariants[w.type] || "outline"}>
                  {typeLabels[w.type]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Wallet className="size-5 text-muted-foreground" />
                Rp {Number(w.balance).toLocaleString("id-ID")}
              </div>
              <form action={deleteWallet} className="mt-3">
                <input type="hidden" name="id" value={w.id} />
                <Button type="submit" variant="destructive" size="sm">
                  <Trash2 className="size-4" />
                  Hapus
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
