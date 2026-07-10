import { prisma } from "@/lib/prisma";
import { getCurrentFamilyMember } from "@/lib/helpers/family";
import { updateSetting } from "@/features/setting/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { NoFamilyPrompt } from "@/components/layout/no-family-prompt";

export default async function SettingsPage() {
  const member = await getCurrentFamilyMember();
  if (!member) return <NoFamilyPrompt />;

  const setting = await prisma.setting.findUnique({
    where: { familyId: member.familyId },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pt-6">
      <h1 className="text-2xl font-bold">Pengaturan</h1>

      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Keluarga</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateSetting} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Mata Uang</Label>
              <select
                id="currency"
                name="currency"
                defaultValue={setting?.currency || "IDR"}
                className="flex h-8 w-full items-center rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="IDR">IDR - Indonesia Rupiah</option>
                <option value="USD">USD - US Dollar</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Zona Waktu</Label>
              <select
                id="timezone"
                name="timezone"
                defaultValue={setting?.timezone || "Asia/Jakarta"}
                className="flex h-8 w-full items-center rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Bahasa</Label>
              <select
                id="language"
                name="language"
                defaultValue={setting?.language || "id"}
                className="flex h-8 w-full items-center rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="id">Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>
            <Button type="submit">
              <Save className="size-4" />
              Simpan
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
