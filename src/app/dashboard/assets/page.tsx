import { prisma } from "@/lib/prisma";
import { getCurrentFamilyMember } from "@/lib/helpers/family";
import { createAsset, deleteAsset, updateAssetValue } from "@/features/asset/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Home, Trash2, Plus } from "lucide-react";
import { NoFamilyPrompt } from "@/components/layout/no-family-prompt";

const categoryLabels: Record<string, string> = {
  PROPERTY: "Properti",
  VEHICLE: "Kendaraan",
  ELECTRONICS: "Elektronik",
  OTHER: "Lainnya",
};

export default async function AssetsPage() {
  const member = await getCurrentFamilyMember();
  if (!member) return <NoFamilyPrompt />;

  const assets = await prisma.asset.findMany({
    where: { familyId: member.familyId },
    orderBy: { createdAt: "desc" },
  });

  const totalValue = assets.reduce((sum, a) => sum + Number(a.currentValue), 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Aset</h1>
        <p className="text-sm text-muted-foreground">
          Total: <span className="font-semibold text-foreground">Rp {totalValue.toLocaleString("id-ID")}</span>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Aset</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createAsset} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input name="name" placeholder="Nama aset (mis. Rumah, Mobil)" required />
              <select
                name="category"
                defaultValue="OTHER"
                className="flex h-8 w-full items-center rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
              >
                <option value="PROPERTY">Properti</option>
                <option value="VEHICLE">Kendaraan</option>
                <option value="ELECTRONICS">Elektronik</option>
                <option value="OTHER">Lainnya</option>
              </select>
              <Input name="purchaseValue" type="number" step="0.01" min="0" required placeholder="Nilai beli" />
              <Input name="currentValue" type="number" step="0.01" min="0" required placeholder="Nilai sekarang" />
              <Input name="purchaseDate" type="date" placeholder="Tanggal beli (opsional)" />
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
        {assets.length === 0 ? (
          <p className="text-muted-foreground text-sm">Belum ada aset tercatat.</p>
        ) : (
          assets.map((a) => {
            const diff = Number(a.currentValue) - Number(a.purchaseValue);
            return (
              <Card key={a.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 font-semibold">
                      <Home className="size-4 text-muted-foreground" />
                      {a.name}
                      <Badge variant="outline">{categoryLabels[a.category]}</Badge>
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      Rp {Number(a.currentValue).toLocaleString("id-ID")}
                      {" "}
                      <span className={diff >= 0 ? "text-green-600" : "text-red-500"}>
                        ({diff >= 0 ? "+" : ""}Rp {diff.toLocaleString("id-ID")})
                      </span>
                      {a.note ? ` — ${a.note}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={updateAssetValue} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={a.id} />
                      <Input
                        name="currentValue"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={Number(a.currentValue)}
                        className="h-8 w-28"
                      />
                      <Button type="submit" size="sm" variant="outline">
                        Update
                      </Button>
                    </form>
                    <form action={deleteAsset}>
                      <input type="hidden" name="id" value={a.id} />
                      <Button type="submit" variant="destructive" size="sm">
                        <Trash2 className="size-4" />
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
