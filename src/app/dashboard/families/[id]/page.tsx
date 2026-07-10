import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { removeMember } from "@/features/family/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, Trash2, User } from "lucide-react";

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
  const isAdmin = currentMember?.role === "ADMIN";

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col p-4 pt-8">
      <a
        href="/dashboard"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" />
        Kembali
      </a>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">{family.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Kode undangan:{" "}
            <span className="font-mono font-medium">{family.inviteCode}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Anggota ({family.members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {family.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                    <User className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {member.profile.name || member.profile.email}
                    </p>
                    <Badge
                      variant={member.role === "ADMIN" ? "default" : "secondary"}
                      className="mt-0.5"
                    >
                      {member.role === "ADMIN" ? (
                        <Shield className="size-3" />
                      ) : null}
                      {member.role === "ADMIN" ? "Admin" : "Anggota"}
                    </Badge>
                  </div>
                </div>
                {isAdmin && member.profileId !== user.id && (
                  <form action={removeMember}>
                    <input type="hidden" name="memberId" value={member.id} />
                    <input type="hidden" name="familyId" value={id} />
                    <Button
                      type="submit"
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="size-4" />
                      Hapus
                    </Button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
