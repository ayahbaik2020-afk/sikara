import { prisma } from "@/lib/prisma";
import { getCurrentFamilyMember } from "@/lib/helpers/family";
import { Card, CardContent } from "@/components/ui/card";
import { History } from "lucide-react";
import { NoFamilyPrompt } from "@/components/layout/no-family-prompt";
import { AccessDenied } from "@/components/layout/access-denied";
import { getAccess } from "@/lib/helpers/access";

export default async function AuditLogPage() {
  const member = await getCurrentFamilyMember();
  if (!member) return <NoFamilyPrompt />;
  if (getAccess("auditLog", member.role) === "none") {
    return <AccessDenied moduleName="Audit Log" />;
  }

  const logs = await prisma.auditLog.findMany({
    where: { familyId: member.familyId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const profileIds = [...new Set(logs.map((l) => l.profileId).filter(Boolean))] as string[];
  const profiles = profileIds.length
    ? await prisma.profile.findMany({
        where: { id: { in: profileIds } },
        select: { id: true, name: true, username: true },
      })
    : [];
  const profileMap = new Map(profiles.map((p) => [p.id, p.name || p.username]));

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pt-6">
      <h1 className="text-2xl font-bold">Riwayat Aktivitas (Audit Log)</h1>
      <p className="text-sm text-muted-foreground -mt-4">
        Menampilkan 100 aktivitas terbaru terkait keuangan keluarga.
      </p>

      {logs.length === 0 ? (
        <p className="text-muted-foreground text-sm">Belum ada aktivitas tercatat.</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="flex items-start gap-3 py-3">
                <History className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm">{log.description}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {log.profileId ? profileMap.get(log.profileId) || "Anggota" : "Sistem"}
                    {" — "}
                    {new Date(log.createdAt).toLocaleString("id-ID")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
