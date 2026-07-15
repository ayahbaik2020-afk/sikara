"use client";

import { useState, useTransition } from "react";
import { createFamilyMember } from "@/features/family/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";

export function AddFamilyMemberDialog({ familyId }: { familyId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createFamilyMember(familyId, formData);
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal membuat anggota");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="size-4" />
          Tambah Anggota
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Anggota Keluarga</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" required autoComplete="off" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password Sementara</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={8}
              required
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">
              Minimal 8 karakter. Sampaikan langsung ke anggota untuk diganti nanti.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship</Label>
            <Select name="relationship" defaultValue="ANAK">
              <SelectTrigger id="relationship">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AYAH">Ayah</SelectItem>
                <SelectItem value="IBU">Ibu</SelectItem>
                <SelectItem value="ANAK">Anak</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Membuat..." : "Tambah Anggota"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
