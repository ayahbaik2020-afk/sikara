# GOAL — Semua Menu Berfungsi Dengan Benar

**Tujuan:** setiap modul di PRD punya menu di sidebar, halaman UI, dan
fungsi CRUD yang benar-benar jalan (bukan cuma server action tanpa UI).

## Prinsip kerja
- Satu modul dikerjakan sampai *selesai & bisa dipakai* sebelum pindah ke modul berikut.
- Setelah tiap modul selesai: update docs/TASKS.md, docs/CHANGELOG.md,
  tambahkan link menu di app-sidebar.tsx, pastikan npm run build sukses.
- Ikuti PROJECT_RULES.md (Tailwind v4, cek package.json sebelum install).

## Checklist Modul

- [x] Transfer — UI + sidebar selesai (perlu di-test manual & npm run build)
- [x] Tagihan (Bills) — selesai (Sprint 9)
- [x] Tabungan (Savings) — digabung dengan Target dalam satu model SavingsGoal
- [x] Target Keuangan (Goals) — lihat di atas
- [ ] Hutang (Debt) — belum ada
- [ ] Piutang (Receivables) — belum ada
- [x] Investasi — selesai (Sprint 11)
- [x] Aset — selesai (Sprint 11)
- [ ] Laporan (PDF/Excel) — belum ada
- [ ] Grafik Dashboard (recharts terinstall, belum dipakai) — belum ada
- [ ] Notifikasi + Audit Log — belum ada
- [ ] Backup & Restore — belum ada
- [ ] Role granular (Ayah/Ibu/Anak) vs schema saat ini (ADMIN/MEMBER)
- [ ] Perbaiki deleteTransfer — deteksi arah dari teks deskripsi (rapuh)

## Urutan pengerjaan
1. Transfer (lengkapi UI)
2. Tagihan
3. Tabungan + Target
4. Aset + Investasi
5. Hutang + Piutang
6. Laporan + Grafik
7. Notifikasi + Audit Log
8. Backup & Restore
9. Review role granular, optimasi, production release
