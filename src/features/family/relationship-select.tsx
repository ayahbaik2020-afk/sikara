"use client";

import { useTransition } from "react";
import { updateMemberRelationship } from "@/features/family/actions";

/**
 * Native <select> dengan onChange TIDAK BOLEH dirender langsung di Server
 * Component (menyebabkan "Event handlers cannot be passed to Client
 * Component props" — crash total di production/Vercel). Dipisah ke sini
 * sebagai Client Component kecil, dipanggil dari families/[id]/page.tsx
 * (Server Component) seperti komponen client lainnya.
 */
export function RelationshipSelect({
  memberId,
  familyId,
  defaultValue,
}: {
  memberId: string;
  familyId: string;
  defaultValue: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const formData = new FormData();
    formData.set("memberId", memberId);
    formData.set("familyId", familyId);
    formData.set("relationship", e.target.value);
    startTransition(() => {
      updateMemberRelationship(formData);
    });
  }

  return (
    <select
      name="relationship"
      defaultValue={defaultValue}
      onChange={handleChange}
      disabled={pending}
      className="flex h-8 items-center rounded-lg border border-input bg-transparent px-2 py-1 text-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
    >
      <option value="AYAH">Ayah</option>
      <option value="IBU">Ibu</option>
      <option value="ANAK">Anak</option>
    </select>
  );
}
