import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <main className="flex flex-col items-center text-center">
        <div
          className="animate-in fade-in zoom-in-90 duration-700 ease-out
            flex h-32 w-32 items-center justify-center rounded-3xl p-6
            bg-gradient-to-br from-emerald-400 via-emerald-400 to-cyan-500
            shadow-[0_20px_45px_-12px_rgba(16,185,129,0.45)]
            sm:h-40 sm:w-40 sm:p-7
            md:h-44 md:w-44 md:p-8"
        >
          <Image
            src="/logo-sikaraman.png"
            alt="SIKARA"
            width={176}
            height={176}
            priority
            className="h-full w-full object-contain"
          />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200 ease-out fill-mode-both mt-8">
          <h1 className="text-4xl font-bold tracking-tight">SIKARA</h1>
          <p className="text-muted-foreground max-w-md text-lg mt-2">
            Sistem Keuangan Keluarga
          </p>
        </div>
      </main>
    </div>
  );
}
