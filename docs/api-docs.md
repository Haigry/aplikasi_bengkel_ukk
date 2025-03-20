# Dokumentasi API

## Endpoint Autentikasi

### POST /api/auth/login
Masuk ke sistem.

**Body Permintaan:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Respons:**
```json
{
  "token": "string",
  "user": {
    "id": "number",
    "nama": "string",
    "email": "string",
    "peran": "string"
  }
}
```

## Endpoint Pemesanan

### GET /api/bookings
Mengambil daftar pemesanan.

**Parameter Query:**
```json
{
  "halaman": "number",
  "perHalaman": "number",
  "status": "string?",
  "tanggalMulai": "string?",
  "tanggalAkhir": "string?"
}
```

### POST /api/bookings
Membuat pemesanan baru.

**Body Permintaan:**
```json
{
  "idPengguna": "number",
  "idLayanan": "number",
  "tanggal": "string",
  "waktu": "string",
  "keterangan": "string?"
}
```

## Endpoint Pengguna

### GET /api/users
Mengambil daftar pengguna.

### POST /api/users
Mendaftarkan pengguna baru.

## Endpoint Layanan

### GET /api/services
Mengambil daftar layanan.

### POST /api/services
Menambah layanan baru.

## Endpoint Sparepart

### GET /api/spareparts
Mengambil daftar suku cadang.

### POST /api/spareparts
Menambah suku cadang baru.

## Kode Status

- 200: Sukses
- 201: Berhasil dibuat
- 400: Permintaan tidak valid
- 401: Tidak terautentikasi
- 403: Tidak memiliki izin
- 404: Data tidak ditemukan
- 500: Kesalahan server
