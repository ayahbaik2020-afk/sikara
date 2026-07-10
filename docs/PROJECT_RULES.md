# PROJECT RULES

## Tech Stack Locked

Framework:
- Next.js 15

Tailwind:
- WAJIB Tailwind CSS v4.x
- DILARANG menggunakan Tailwind v3
- DILARANG memakai tutorial/config/plugin khusus v3
- Jangan menggunakan tailwind.config.js jika tidak diperlukan oleh Tailwind v4
- Ikuti dokumentasi resmi Tailwind v4

UI:
- shadcn/ui versi kompatibel Tailwind v4

Database:
- Supabase PostgreSQL
- Prisma ORM

Deployment:
- Vercel

## AI Rules

AI wajib mengecek package.json sebelum menambah dependency.

Jika menemukan dependency Tailwind v3 maka:
- hentikan perubahan
- migrasikan ke v4 terlebih dahulu

Seluruh dependency harus kompatibel dengan Next.js 15.
