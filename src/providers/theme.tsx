"use client";

import { useEffect } from "react";

// SIKARA Design System: Light theme only (Master Refactor Prompt - THEME).
// Dark mode dinonaktifkan secara sengaja. Store lama (@/store/theme) masih
// ada untuk kompatibilitas kalau ada kode lain yang membacanya, tapi tidak
// lagi dipakai untuk toggle class "dark" di sini.
// TODO (dicatat, belum dieksekusi tanpa persetujuan): hapus src/store/theme.ts
// dan seluruh pemanggilnya kalau sudah dipastikan tidak dipakai di tempat lain.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("theme");
  }, []);

  return <>{children}</>;
}
