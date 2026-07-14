import type { SVGProps } from "react";

/**
 * Ikon "Celengan Ayam" — pengganti PiggyBank (lucide-react) untuk modul
 * Savings/Tabungan, sesuai SIKARA Master Refactor Prompt (bagian ICON).
 * Dibuat manual karena lucide-react belum punya ikon ayam/celengan ayam.
 * Mengikuti konvensi lucide: viewBox 24x24, stroke currentColor, strokeWidth 2,
 * supaya bisa dipakai dengan className yang sama (mis. "size-4").
 */
export function PiggyChicken(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Badan */}
      <path d="M5 13.5c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5-3.1 6.5-7 6.5-7-2.9-7-6.5Z" />
      {/* Jengger */}
      <path d="M10.3 7.4c-.4-1-.1-2 .7-2.5-.5-.7-.3-1.6.4-1.9.6-.3 1.3 0 1.6.6.5-.5 1.3-.5 1.8 0 .5.5.4 1.3-.1 1.8.8.3 1.2 1.2.9 2.1" />
      {/* Paruh */}
      <path d="M18.5 12.2c.9-.1 1.6.5 1.5 1.3-.1.6-.7 1-1.3 1" />
      {/* Mata */}
      <circle cx="15.2" cy="12" r=".6" fill="currentColor" stroke="none" />
      {/* Slot koin di punggung */}
      <path d="M9.5 8.7 10 7.2" />
      {/* Kaki */}
      <path d="M8.5 19.5 8 21M15.5 19.5 15 21" />
    </svg>
  );
}
