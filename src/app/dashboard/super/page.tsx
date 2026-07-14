import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/helpers/family";
import { isSuperAdmin } from "@/lib/helpers/access";
import { createFamilyAsSuperAdmin } from "@/features/family/actions";
import { AccessDenied } from "@/components/layout/access-denied";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users } from "lucide-react";

// Area khusus Super Admin: kelola seluruh family lintas tenant.
// Tidak memakai getAccess()/matrix modul keuangan — role SUPER_ADMIN
// dicek langsung dari Profile.role (role global), bukan FamilyMember.
export default async function SuperAdminPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  if (!isSuperAdmin(profile.role)) {
    return <AccessDenied moduleName="Super Admin" />;
  }

  const families = await prisma.family.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { members: true } },
      members: {
        where: { systemRole: "FAMILY_ADMIN" },
        include: { profile: { select: { name: true, username: true } } },
        take: 1,
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Kelola Family</h1>
        <p className="text-sm text-muted-foreground">
          Super Admin — buat dan pantau seluruh family yang terdaftar di Sikara.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Buat Family Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createFamilyAsSuperAdmin} className="flex gap-2">
            <Input name="name" placeholder="Nama keluarga" required className="max-w-sm" />
            <Button type="submit">Buat Family</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {families.length === 0 && (
          <p className="text-sm text-muted-foreground">Belum ada family terdaftar.</p>
        )}
        {families.map((family) => {
          const admin = family.members[0]?.profile;
          return (
            <Card key={family.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{family.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {admin
                      ? `Family Admin: ${admin.name ?? admin.username}`
                      : "Belum ada Family Admin"}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="size-4" />
                  {family._count.members} anggota
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
