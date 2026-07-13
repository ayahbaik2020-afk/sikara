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
- [x] Hutang (Debt) — selesai (Sprint 12)
- [x] Piutang (Receivables) — selesai (Sprint 12)
- [x] Investasi — selesai (Sprint 11)
- [x] Aset — selesai (Sprint 11)
- [x] Laporan (grafik di layar, tanpa export — sesuai keputusan) — selesai (Sprint 13)
- [x] Grafik Dashboard (bar chart 6 bulan + pie chart kategori) — selesai (Sprint 13)
- [x] Notifikasi (dihitung on-the-fly: tagihan lewat/mendekati jatuh tempo, target tercapai, hutang/piutang lewat jatuh tempo) — selesai (Sprint 14)
- [x] Audit Log (transaksi, transfer, bayar tagihan/hutang, tabungan, terima piutang) — selesai (Sprint 14)
- [ ] Backup & Restore — belum ada
- [ ] Role granular (Ayah/Ibu/Anak) vs schema saat ini (ADMIN/MEMBER)
- [x] Perbaiki deleteTransfer — sudah dirapikan (hapus dead code, tetap pakai deteksi deskripsi tapi lebih bersih)

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
