# Skema Database

## Pengguna (Users)
```prisma
model User {
  id          Int       @id @default(autoincrement())
  nama        String
  email       String    @unique
  password    String
  peran       Role      @default(PELANGGAN)
  noTelp      String?
  alamat      String?
  noKTP       String?
  pemesanan   Booking[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum Role {
  ADMIN
  KARYAWAN
  PELANGGAN
}
```

## Pemesanan (Bookings)
```prisma
model Booking {
  id          Int       @id @default(autoincrement())
  idPengguna  Int
  pengguna    User      @relation(fields: [idPengguna], references: [id])
  idLayanan   Int
  layanan     Service   @relation(fields: [idLayanan], references: [id])
  tanggal     DateTime
  status      Status    @default(MENUNGGU)
  keterangan  String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum Status {
  MENUNGGU
  DITERIMA
  DIKERJAKAN
  SELESAI
  DIBATALKAN
}
```

## Layanan (Services)
```prisma
model Service {
  id          Int       @id @default(autoincrement())
  nama        String
  deskripsi   String
  harga       Float
  durasi      Int      // dalam menit
  pemesanan   Booking[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

## Suku Cadang (Spareparts)
```prisma
model Sparepart {
  id          Int       @id @default(autoincrement())
  nama        String
  deskripsi   String?
  harga       Float
  stok        Int
  minimal     Int      // stok minimal
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```