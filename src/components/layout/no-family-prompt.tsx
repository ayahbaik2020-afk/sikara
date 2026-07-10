import { Users, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createFamily, joinFamily } from "@/features/family/actions";

export function NoFamilyPrompt() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <Users className="mx-auto mb-4 size-12 text-muted-foreground" />
      <h2 className="text-xl font-bold">Belum Ada Keluarga</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Buat keluarga baru atau gabung dengan kode undangan untuk mulai
        menggunakan fitur ini.
      </p>

      <div className="mt-6 space-y-4">
        <Card>
          <CardContent className="pt-4">
            <form action={createFamily} className="flex gap-2">
              <Input
                name="name"
                placeholder="Nama keluarga"
                required
                className="flex-1"
              />
              <Button type="submit">
                <Plus className="size-4" />
                Buat
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <form action={joinFamily} className="flex gap-2">
              <Input
                name="inviteCode"
                placeholder="Kode undangan"
                required
                className="flex-1"
              />
              <Button type="submit" variant="outline">
                Gabung
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
