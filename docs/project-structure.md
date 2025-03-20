# Struktur Proyek

## Struktur Direktori

```
src/
├── app/                    # Router Next.js 13+
│   ├── admin/             # Halaman dashboard admin
│   ├── api/               # Rute API
│   ├── customer/          # Halaman pelanggan
│   ├── karyawan/          # Halaman karyawan
│   └── login/             # Halaman autentikasi
├── components/            # Komponen React
│   ├── admin/            # Komponen khusus admin
│   ├── auth/             # Komponen autentikasi
│   ├── booking/          # Komponen pemesanan
│   ├── common/           # Komponen bersama
│   ├── ui/               # Komponen UI
│   └── landingPage/      # Komponen beranda
├── contexts/             # Context providers
├── hooks/                # Custom hooks
├── lib/                  # Utilitas
├── providers/           # App providers
├── styles/              # CSS & styles
├── types/               # TypeScript types
└── utils/               # Fungsi utilitas
```

## Penjelasan Direktori Utama

### Direktori App (`src/app/`)
- **admin/** - Pusat kontrol admin
  - `dashboard/` - Ringkasan dan statistik
  - `users/` - Pengelolaan pengguna
  - `products/` - Pengelolaan suku cadang
  - `reports/` - Laporan dan analisa
  - `orders/` - Pengelolaan pesanan

- **api/** - Endpoint API backend
  - `auth/` - Endpoint autentikasi
  - `admin/` - Rute API admin
  - `customer/` - Rute API pelanggan
  - `booking/` - Rute API pemesanan

- **customer/** - Interface pelanggan
  - `booking/` - Sistem pemesanan
  - `history/` - Riwayat service
  - `profile/` - Manajemen profil

- **karyawan/** - Interface karyawan
  - `orders/` - Manajemen pesanan
  - `spareparts/` - Stok management
  - `reports/` - Laporan harian

### Komponen (`src/components/`)

#### Komponen Admin
- `Dashboard/` - Tampilan dashboard
- `UserManagement/` - Kelola pengguna
- `InventoryManagement/` - Kelola inventaris
- `ReportGenerator/` - Pembuat laporan

#### Komponen Umum
- `Modal/` - Jendela dialog
- `Table/` - Tabel data
- `Form/` - Komponen formulir
- `Button/` - Tombol kustom
- `Card/` - Wadah kartu
- `Pagination/` - Navigasi halaman

#### Komponen UI
- `Layout/` - Template layout
- `Navigation/` - Menu dan navbar
- `Loading/` - Status pemuatan
- `Error/` - Batasan error
- `Toast/` - Notifikasi

### Utilitas (`src/utils/`)
- `api.ts` - Pembantu API
- `auth.ts` - Utilitas autentikasi
- `formatter.ts` - Format data
- `validator.ts` - Validasi masukan
- `pdfGenerator.ts` - Pembuat PDF
- `dateUtils.ts` - Format tanggal
- `errorHandler.ts` - Penanganan kesalahan

### Pustaka (`src/lib/`)
- `prisma.ts` - Klien Prisma
- `nextauth.ts` - Konfigurasi NextAuth
- `constants.ts` - Konstanta aplikasi
- `types.ts` - Definisi tipe

### Hooks (`src/hooks/`)
- `useAuth.ts` - Hook autentikasi
- `useForm.ts` - Hook formulir
- `useModal.ts` - Hook modal
- `useToast.ts` - Hook notifikasi
- `useDebounce.ts` - Hook debounce

### Penyedia (`src/providers/`)
- `AuthProvider.tsx` - Konteks autentikasi
- `ThemeProvider.tsx` - Konteks tema
- `ToastProvider.tsx` - Notifikasi toast
- `ModalProvider.tsx` - Konteks modal

### Gaya (`src/styles/`)
- `globals.css` - Gaya global
- `components.ts` - Gaya komponen
- `tailwind.css` - Konfigurasi Tailwind
- `variables.css` - Variabel CSS

## Aturan Penamaan

### Berkas
- Komponen: PascalCase (`KartuPengguna.tsx`)
- Hooks: camelCase (`useAutentikasi.ts`)
- Utilitas: camelCase (`formatTanggal.ts`)
- Konstanta: UPPERCASE (`RUTE.ts`)

### Komponen
- Komponen Fungsional: PascalCase
- Antarmuka Props: NamaKomponenProps
- Gaya: Metodologi BEM

### Rute API
- Konvensi REST
- Versi jika diperlukan
- Respons error yang jelas

## Praktik Terbaik

### Komponen
- Prinsip Desain Atomik
- Dapat digunakan ulang & modular
- Validasi props
- Penanganan error

### Manajemen State
- Context untuk state global
- React Query untuk state server
- State lokal bila memungkinkan

### Performa
- Pemisahan kode
- Pemuatan lambat
- Optimasi gambar
- Memoization