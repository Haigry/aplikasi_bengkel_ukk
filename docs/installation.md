# Panduan Instalasi

## Prasyarat
- Node.js (v18 atau lebih tinggi)
- PostgreSQL database
- npm atau yarn

## Langkah-langkah Instalasi

### 1. Klon Repositori
```bash
git clone <url-repositori>
cd aplikasi_bengkel_ukk
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Buat file `.env` dengan isi:
```plaintext
DATABASE_URL="postgresql://user:password@localhost:5432/db_name"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Setup Database
```bash
npx prisma migrate dev
```

### 5. Jalankan Development Server
```bash
npm run dev
```

## Troubleshooting
- Jika menemui masalah dengan Prisma, coba:
  ```bash
  npx prisma generate
  ```
- Jika ada masalah dengan dependencies:
  ```bash
  rm -rf node_modules
  npm install
  ```