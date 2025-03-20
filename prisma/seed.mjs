import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const customerData = [
  {
    name: 'Budi Santoso',
    email: 'budi.s@example.com',
    noTelp: '081234567890',
    alamat: 'Jl. Mawar No. 1, Jakarta',
    NoKTP: '3171234567890001',
    password: 'password123'
  },
  {
    name: 'Dewi Kusuma',
    email: 'dewi.k@example.com',
    noTelp: '081234567891',
    alamat: 'Jl. Melati No. 2, Bandung',
    NoKTP: '3171234567890002',
    password: 'password123'
  },
  {
    name: 'Ahmad Rizki',
    email: 'ahmad.r@example.com',
    noTelp: '081234567892',
    alamat: 'Jl. Anggrek No. 3, Surabaya',
    NoKTP: '3171234567890003',
    password: 'password123'
  },
  {
    name: 'Siti Nurhaliza',
    email: 'siti.n@example.com',
    noTelp: '081234567893',
    alamat: 'Jl. Dahlia No. 4, Medan',
    NoKTP: '3171234567890004',
    password: 'password123'
  },
  {
    name: 'Rudi Hermawan',
    email: 'rudi.h@example.com',
    noTelp: '081234567894',
    alamat: 'Jl. Kenanga No. 5, Semarang',
    NoKTP: '3171234567890005',
    password: 'password123'
  },
  {
    name: 'Rina Wati',
    email: 'rina.w@example.com',
    noTelp: '081234567895',
    alamat: 'Jl. Tulip No. 6, Yogyakarta',
    NoKTP: '3171234567890006',
    password: 'password123'
  },
  {
    name: 'Joko Widodo',
    email: 'joko.w@example.com',
    noTelp: '081234567896',
    alamat: 'Jl. Lotus No. 7, Solo',
    NoKTP: '3171234567890007',
    password: 'password123'
  },
  {
    name: 'Maya Sari',
    email: 'maya.s@example.com',
    noTelp: '081234567897',
    alamat: 'Jl. Kamboja No. 8, Malang',
    NoKTP: '3171234567890008',
    password: 'password123'
  },
  {
    name: 'Dedi Kurniawan',
    email: 'dedi.k@example.com',
    noTelp: '081234567898',
    alamat: 'Jl. Sakura No. 9, Palembang',
    NoKTP: '3171234567890009',
    password: 'password123'
  },
  {
    name: 'Linda Susanti',
    email: 'linda.s@example.com',
    noTelp: '081234567899',
    alamat: 'Jl. Rose No. 10, Makassar',
    NoKTP: '3171234567890010',
    password: 'password123'
  },
  {
    name: 'Hendra Wijaya',
    email: 'hendra.w@example.com',
    noTelp: '081234567810',
    alamat: 'Jl. Iris No. 11, Denpasar',
    NoKTP: '3171234567890011',
    password: 'password123'
  },
  {
    name: 'Ani Yudhoyono',
    email: 'ani.y@example.com',
    noTelp: '081234567811',
    alamat: 'Jl. Violet No. 12, Manado',
    NoKTP: '3171234567890012',
    password: 'password123'
  },
  {
    name: 'Bambang Susilo',
    email: 'bambang.s@example.com',
    noTelp: '081234567812',
    alamat: 'Jl. Lily No. 13, Balikpapan',
    NoKTP: '3171234567890013',
    password: 'password123'
  },
  {
    name: 'Nina Maulida',
    email: 'nina.m@example.com',
    noTelp: '081234567813',
    alamat: 'Jl. Jasmine No. 14, Samarinda',
    NoKTP: '3171234567890014',
    password: 'password123'
  },
  {
    name: 'Agus Setiawan',
    email: 'agus.s@example.com',
    noTelp: '081234567814',
    alamat: 'Jl. Orchid No. 15, Pontianak',
    NoKTP: '3171234567890015',
    password: 'password123'
  },
  {
    name: 'Sri Wahyuni',
    email: 'sri.w@example.com',
    noTelp: '081234567815',
    alamat: 'Jl. Sunflower No. 16, Banjarmasin',
    NoKTP: '3171234567890016',
    password: 'password123'
  },
  {
    name: 'Eko Prasetyo',
    email: 'eko.p@example.com',
    noTelp: '081234567816',
    alamat: 'Jl. Chrysant No. 17, Pekanbaru',
    NoKTP: '3171234567890017',
    password: 'password123'
  },
  {
    name: 'Yuni Shara',
    email: 'yuni.s@example.com',
    noTelp: '081234567817',
    alamat: 'Jl. Tulip No. 18, Padang',
    NoKTP: '3171234567890018',
    password: 'password123'
  },
  {
    name: 'Iwan Setiawan',
    email: 'iwan.s@example.com',
    noTelp: '081234567818',
    alamat: 'Jl. Daisy No. 19, Jambi',
    NoKTP: '3171234567890019',
    password: 'password123'
  },
  {
    name: 'ADMIN',
    email: 'min@admin.com',
    noTelp: '081534567001',
    alamat: 'Jl. Bengkel No. 1, Jakarta',
    NoKTP: '3171234567800333',
    password: '12qw',
  },
  {
    name: 'Rina Marlina',
    email: 'rina.m@example.com',
    noTelp: '081234567819',
    alamat: 'Jl. Magnolia No. 20, Bengkulu',
    NoKTP: '3171234567890020',
    password: 'password123'
  }
];

const karyawanData = [
  {
    user: {
      name: 'Ahmad Teknisi',
      email: 'ahmad.teknisi@bengkel.com',
      noTelp: '081234567001',
      alamat: 'Jl. Bengkel No. 1, Jakarta',
      NoKTP: '3171234567800001',
      password: 'karyawan123',
      role: 'KARYAWAN'
    },
    name: 'Ahmad Teknisi',
    position: 'Senior Mechanic'
  },
  {
    user: {
      name: 'Budi Mekanik',
      email: 'budi.mekanik@bengkel.com',
      noTelp: '081234567002',
      alamat: 'Jl. Bengkel No. 2, Jakarta',
      NoKTP: '3171234567800002',
      password: 'karyawan123',
      role: 'KARYAWAN'
    },
    name: 'Budi Mekanik',
    position: 'Engine Specialist'
  },
  {
    user: {
      name: 'Citra Sparepart',
      email: 'citra.part@bengkel.com',
      noTelp: '081234567003',
      alamat: 'Jl. Bengkel No. 3, Jakarta',
      NoKTP: '3171234567800003',
      password: 'karyawan123',
      role: 'KARYAWAN'
    },
    name: 'Citra Sparepart',
    position: 'Parts Specialist'
  },
  {
    user: {
      name: 'Deni Service',
      email: 'deni.service@bengkel.com',
      noTelp: '081234567004',
      alamat: 'Jl. Bengkel No. 4, Jakarta',
      NoKTP: '3171234567800004',
      password: 'karyawan123',
      role: 'KARYAWAN'
    },
    name: 'Deni Service',
    position: 'Service Advisor'
  },
  {
    user: {
      name: 'Eko Electrical',
      email: 'eko.electrical@bengkel.com',
      noTelp: '081234567005',
      alamat: 'Jl. Bengkel No. 5, Jakarta',
      NoKTP: '3171234567800005',
      password: 'karyawan123',
      role: 'KARYAWAN'
    },
    name: 'Eko Electrical',
    position: 'Electrical Specialist'
  }
];

const serviceData = [
  {
    name: 'Regular Service',
    description: 'Basic maintenance service including oil change and inspection',
    harga: 350000
  },
  {
    name: 'Engine Tune Up',
    description: 'Complete engine tuning and optimization',
    harga: 500000
  },
  {
    name: 'Brake Service',
    description: 'Brake pad replacement and brake system maintenance',
    harga: 400000
  },
  {
    name: 'Transmission Service',
    description: 'Transmission fluid change and system check',
    harga: 600000
  },
  {
    name: 'AC Service',
    description: 'Air conditioning system maintenance and recharge',
    harga: 450000
  }
];

const sparepartData = [
  {
    name: 'Engine Oil Filter',
    harga: 50000,
    stok: 100
  },
  {
    name: 'Air Filter',
    harga: 75000,
    stok: 80
  },
  {
    name: 'Brake Pads',
    harga: 250000,
    stok: 50
  },
  {
    name: 'Spark Plugs Set',
    harga: 120000,
    stok: 60
  },
  {
    name: 'Timing Belt',
    harga: 350000,
    stok: 30
  },
  {
    name: 'Battery',
    harga: 800000,
    stok: 25
  },
  {
    name: 'Radiator Coolant',
    harga: 85000,
    stok: 70
  },
  {
    name: 'Power Steering Fluid',
    harga: 65000,
    stok: 45
  },
  {
    name: 'Transmission Fluid',
    harga: 95000,
    stok: 40
  },
  {
    name: 'Brake Fluid',
    harga: 55000,
    stok: 55
  }
];

async function main() {
  console.log('Starting seed...');

  // Clear existing data (optional, use with caution)
  await prisma.riwayatLaporan.deleteMany();
  await prisma.laporan.deleteMany();
  await prisma.riwayatSparepart.deleteMany();
  await prisma.riwayat.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.karyawan.deleteMany();
  await prisma.kendaraan.deleteMany();
  await prisma.sparepart.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  // Seed customers
  for (const customer of customerData) {
    const existingUser = await prisma.user.findUnique({
      where: { email: customer.email }
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(customer.password, 10);
      await prisma.user.create({
        data: {
          ...customer,
          password: hashedPassword,
          role: 'CUSTOMER'
        }
      });
    }
  }

  // Seed karyawan
  console.log('Seeding karyawan...');
  for (const karyawan of karyawanData) {
    const existingUser = await prisma.user.findUnique({
      where: { email: karyawan.user.email }
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(karyawan.user.password, 10);
      
      // Create user first
      const user = await prisma.user.create({
        data: {
          ...karyawan.user,
          password: hashedPassword
        }
      });

      // Then create karyawan with user relation
      await prisma.karyawan.create({
        data: {
          name: karyawan.name,
          position: karyawan.position,
          userId: user.id
        }
      });
    }
  }

  // Seed services
  for (const service of serviceData) {
    const existingService = await prisma.service.findFirst({
      where: { name: service.name }
    });

    if (!existingService) {
      await prisma.service.create({
        data: service
      });
    }
  }

  // Seed spareparts
  for (const sparepart of sparepartData) {
    const existingSparepart = await prisma.sparepart.findFirst({
      where: { name: sparepart.name }
    });

    if (!existingSparepart) {
      await prisma.sparepart.create({
        data: sparepart
      });
    }
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });