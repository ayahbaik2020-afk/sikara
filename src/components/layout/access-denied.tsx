import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export function AccessDenied({ moduleName }: { moduleName: string }) {
  return (
    <div className="mx-auto max-w-md pt-16">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <ShieldAlert className="size-10 text-red-500" />
          <p className="font-semibold">Akses Ditolak</p>
          <p className="text-sm text-muted-foreground">
            Role Anda saat ini tidak memiliki akses ke halaman {moduleName}.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
