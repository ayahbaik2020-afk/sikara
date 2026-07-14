import { getCurrentFamilyMember } from "@/lib/helpers/family";
import { restoreBackup } from "@/features/backup/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, AlertTriangle } from "lucide-react";
import { NoFamilyPrompt } from "@/components/layout/no-family-prompt";
import { AccessDenied } from "@/components/layout/access-denied";
import { getAccess } from "@/lib/helpers/access";

export default async function BackupPage() {
  const member = await getCurrentFamilyMember();
  if (!member) return <NoFamilyPrompt />;
  if (getAccess("backup", member.role) === "none") {
    return <AccessDenied moduleName="Backup & Restore" />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 pt-6">
      <h1 className="text-2xl font-bold">Backup & Restore</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="size-5" /> Backup Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Unduh seluruh data keuangan keluarga (dompet, kategori, transaksi,
            tagihan, tabungan, aset, investasi, hutang, piutang) sebagai satu
            file JSON. Simpan file ini di tempat aman.
          </p>
          <a href="/api/backup" download>
            <Button type="button">
              <Download className="size-4" />
              Unduh Backup
            </Button>
          </a>
        </CardContent>
      </Card>

      <Card className="border-red-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-500">
            <Upload className="size-5" /> Restore dari Backup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>
              <strong>Peringatan:</strong> Restore akan{" "}
              <strong>menghapus seluruh data finansial saat ini</strong> dan
              menggantinya dengan isi file backup. Hanya bisa restore dari
              file backup keluarga ini sendiri. Tindakan ini tidak bisa
              dibatalkan.
            </p>
          </div>
          <form action={restoreBackup} className="space-y-3">
            <input
              type="file"
              name="file"
              accept="application/json"
              required
              className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:text-primary-foreground"
            />
            <Button type="submit" variant="destructive">
              <Upload className="size-4" />
              Restore Sekarang
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
