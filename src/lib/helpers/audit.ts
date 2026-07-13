import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

/**
 * Catat satu entri audit log. Dipanggil dari server actions yang melakukan
 * perubahan penting (transaksi, transfer, pembayaran tagihan/hutang, dll).
 * Gagal mencatat log tidak boleh menggagalkan aksi utama, jadi errornya
 * hanya di-catch dan di-log ke console.
 */
export async function logAudit(
  familyId: string,
  action: string,
  description: string
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await prisma.auditLog.create({
      data: {
        familyId,
        profileId: user?.id ?? null,
        action,
        description,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
