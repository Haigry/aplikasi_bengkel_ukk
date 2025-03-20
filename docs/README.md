# Aplikasi Bengkel UKK

## Deskripsi
Aplikasi manajemen bengkel berbasis web yang dibangun dengan Next.js, Prisma, dan TypeScript.

## Fitur Utama
- Manajemen Peran Pengguna (Admin, Pelanggan, Karyawan)
- Sistem Manajemen Pemesanan
- Manajemen Pelanggan
- Manajemen Layanan
- Dashboard Responsif
- Pembuatan Kwitansi PDF
- Sistem Antrian Service
- Manajemen Stok Sparepart
- Laporan Keuangan
- Histori Service Kendaraan

## Dokumentasi
Dokumentasi lengkap dapat ditemukan di folder [`docs`](docs/):
- [Panduan Instalasi](docs/installation.md)
- [Struktur Proyek](docs/project-structure.md)
- [Dokumentasi API](docs/api-docs.md)
- [Skema Database](docs/database-schema.md)
- [Panduan Kontribusi](docs/contributing.md)

## Teknologi yang Digunakan
- Antarmuka: Next.js, React, TypeScript, Tailwind CSS
- Backend: Next.js API Routes
- Basis Data: MySQL dengan Prisma ORM
- Autentikasi: NextAuth.js
- Pembuat PDF: jsPDF
- Grafik: Recharts
- Penanganan Form: React Hook Form
- Manajemen State: React Context
- Komponen UI: Headless UI

## Prasyarat
- Node.js versi 16 atau lebih baru
- Basis Data MySQL
- Git

## Mulai Cepat
```bash
# Klon repositori
git clone <url-repositori>

# Pasang dependensi
npm install

# Siapkan variabel lingkungan
cp .env.example .env

# Jalankan migrasi database
npx prisma migrate dev

# Jalankan server pengembangan
npm run dev
```

## Variabel Lingkungan
Buat berkas `.env` dengan variabel berikut:
```
DATABASE_URL="mysql://user:password@localhost:3306/bengkel_db"
NEXTAUTH_SECRET="kunci-rahasia-anda"
NEXTAUTH_URL="http://localhost:3000"
```

## Struktur Folder
```
.
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   ├── lib/             # Shared utilities
│   ├── styles/          # CSS styles
│   ├── types/           # TypeScript types
│   └── utils/           # Helper functions
├── prisma/              # Database schema & migrations
├── public/              # Static files
└── docs/               # Documentation
```

## Fitur Berdasarkan Peran
### Admin
- Kelola pengguna
- Laporan keuangan
- Pengaturan layanan
- Kelola stok

### Karyawan
- Proses servis
- Perbarui status pesanan
- Kelola suku cadang
- Buat faktur

### Pelanggan
- Pesan servis
- Lacak status
- Riwayat servis
- Unduh faktur

## Pengujian
```bash
# Jalankan unit test
npm run test

# Jalankan e2e test
npm run test:e2e
```

## Deployment
```bash
# Build aplikasi
npm run build

# Jalankan server produksi
npm start
```

## Kontribusi
Silakan baca [panduan kontribusi](docs/contributing.md) untuk detail lebih lanjut.

## Dukungan
Untuk bantuan dan pertanyaan, silakan buka issue di repositori GitHub.

## Penulis
- Haryo
- SMKN 1 Bantul

## Lisensi
Proyek ini dilisensikan di bawah [Lisensi MIT](LICENSE).

## Ucapan Terima Kasih
- Tim Next.js
- Tim Prisma
- Tailwind CSS
- Vercel
- Headless UI
