import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { removeMember, updateMemberRelationship } from "@/features/family/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, Trash2, User } from "lucide-react";

const relationshipLabels: Record<string, string> = {
  AYAH: "Ayah",
  IBU: "Ibu",
  ANAK: "Anak",
};

export default async function FamilyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const family = await prisma.family.findUnique({
    where: { id },
    include: {
      members: {
        include: { profile: true },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  if (!family) notFound();

  const currentMember = family.members.find(
    (m) => m.profileId === user.id,
  );
  const isAdmin = currentMember?.systemRole === "FAMILY_ADMIN";

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pt-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{family.name}</h1>
        <p className="text-muted-foreground text-sm">
          {family.members.length} anggota
        </p>
      </div>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kode Undangan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2 text-sm">
              Bagikan kode ini ke anggota keluarga lain agar dapat bergabung.
            </p>
            <code className="bg-muted rounded-md px-3 py-1.5 text-sm font-semibold tracking-wide">
              {family.inviteCode}
            </code>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Anggota Keluarga</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {family.members.map((member) => {
            const isSelf = member.profileId === user.id;
            return (
              <div
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-muted flex size-9 items-center justify-center rounded-full">
                    <User className="text-muted-foreground size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-medium">
                      {member.profile.name || member.profile.username}
                      {member.systemRole === "FAMILY_ADMIN" && (
                        <Shield className="size-3.5 text-emerald-500" />
                      )}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      @{member.profile.username}
                      {isSelf && " (Anda)"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {relationshipLabels[member.relationship]}
                  </Badge>
                  <Badge variant={member.systemRole === "FAMILY_ADMIN" ? "default" : "secondary"}>
                    {member.systemRole === "FAMILY_ADMIN" ? "Admin" : "Anggota"}
                  </Badge>

                  {isAdmin && (
                    <form action={updateMemberRelationship} className="flex items-center">
                      <input type="hidden" name="memberId" value={member.id} />
                      <input type="hidden" name="familyId" value={family.id} />
                      <select
                        name="relationship"
                        defaultValue={member.relationship}
                        onChange={(e) => e.currentTarget.form?.requestSubmit()}
                        className="flex h-8 items-center rounded-lg border border-input bg-transparent px-2 py-1 text-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <option value="AYAH">Ayah</option>
                        <option value="IBU">Ibu</option>
                        <option value="ANAK">Anak</option>
                      </select>
                    </form>
                  )}

                  {isAdmin && !isSelf && (
                    <form action={removeMember}>
                      <input type="hidden" name="memberId" value={member.id} />
                      <input type="hidden" name="familyId" value={family.id} />
                      <Button type="submit" variant="destructive" size="sm">
                        <Trash2 className="size-4" />
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
