import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client'
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Remove individual type imports and use generated types
type User = any;
type Karyawan = any;
type Sparepart = any;
type Service = any;
type Riwayat = any;
type Role = 'ADMIN' | 'KARYAWAN' | 'CUSTOMER';

const handleError = (error: any) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
};

// Generic CRUD operations
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const model = searchParams.get('model');
    const id = searchParams.get('id');
    const role = searchParams.get('role');

    if (model === 'booking') {
      const bookings = await prisma.booking.findMany({
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      });
      return NextResponse.json(bookings);
    }

    if (model === 'karyawan') {
      const karyawan = await prisma.karyawan.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true
            }
          }
        }
      });
      return NextResponse.json(karyawan);
    }

    switch (model) {
      case 'user':
        if (role) {
          return NextResponse.json(
            await prisma.user.findMany({
              where: { role: role as Role }
            })
          );
        }
        return NextResponse.json(
          id ? await prisma.user.findUnique({ where: { id: Number(id) } }) 
            : await prisma.user.findMany()
        );
      case 'karyawan':
        return NextResponse.json(
          id ? await prisma.karyawan.findUnique({
            where: { id: Number(id) },
            include: { user: true }
          })
          : await prisma.karyawan.findMany({
            include: { user: true }
          })
        );
      case 'sparepart':
        return NextResponse.json(
          id ? await prisma.sparepart.findUnique({ where: { id: Number(id) } })
            : await prisma.sparepart.findMany()
        );
      case 'service':
        return NextResponse.json(
          id ? await prisma.service.findUnique({ where: { id: Number(id) } })
            : await prisma.service.findMany()
        );
      case 'riwayat':
        return NextResponse.json(
          id ? await prisma.riwayat.findUnique({
            where: { id: Number(id) },
            include: {
              user: true,
              karyawan: true,
              kendaraan: true,
              service: true,
              sparepart: true
            }
          })
          : await prisma.riwayat.findMany({
            include: {
              user: true,
              karyawan: true,
              kendaraan: true,
              service: true,
              sparepart: true
            }
          })
        );
      case 'kendaraan':
        return NextResponse.json(
          id ? await prisma.kendaraan.findUnique({ 
            where: { id: String(id) } 
          })
          : await prisma.kendaraan.findMany({
            include: {
              user: true
            }
          })
        );
      default:
        return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
    }
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { model, data } = await request.json();

    if (model === 'karyawan') {
      // Validate required fields
      if (!data.name || !data.email || !data.position || !data.userId) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Check if user exists and has KARYAWAN role
      const user = await prisma.user.findUnique({
        where: { id: data.userId }
      });

      if (!user || user.role !== 'KARYAWAN') {
        return NextResponse.json(
          { error: 'Invalid user or user role' },
          { status: 400 }
        );
      }

      // Create karyawan with connection to existing user
      const karyawan = await prisma.karyawan.create({
        data: {
          name: data.name,
          position: data.position,
          user: {
            connect: {
              id: data.userId
            }
          }
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        data: karyawan
      });
    }

    // Validate sparepart data
    if (model === 'sparepart') {
      if (!data.name || data.harga === undefined || data.stok === undefined) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const sparepart = await prisma.sparepart.create({
        data: {
          name: data.name,
          harga: data.harga,
          stok: data.stok
        }
      });

      return NextResponse.json(sparepart);
    }

    if (model === 'riwayat') {
      const riwayat = await prisma.riwayat.create({
        data: {
          userId: data.userId,
          karyawanId: data.karyawanId,
          kendaraanId: data.kendaraanId,
          serviceId: data.serviceId,
          sparepartId: data.sparepartId,
          totalHarga: data.totalHarga,
          quantity: data.quantity,
          harga: data.harga
        },
        include: {
          user: true,
          karyawan: true,
          kendaraan: true,
          service: true,
          sparepart: true
        }
      });
      return NextResponse.json(riwayat);
    }

    switch (model) {
      case 'user':
        // Hash password before creating user
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return NextResponse.json(
          await prisma.user.create({ 
            data: {
              ...data,
              password: hashedPassword
            }
          })
        );
        
      case 'karyawan':
        return NextResponse.json(await prisma.karyawan.create({ data }));
      case 'sparepart':
        return NextResponse.json(await prisma.sparepart.create({ data }));
      case 'service':
        return NextResponse.json(await prisma.service.create({ data }));
      case 'riwayat':
        return NextResponse.json(await prisma.riwayat.create({
          data,
          include: {
            user: true,
            karyawan: true
          }
        }));
      case 'kendaraan':
        // Validate kendaraan data
        if (!data.noPolisi || !data.merk || !data.userId) {
          return NextResponse.json(
            { error: 'Missing required fields (noPolisi, merk, userId)' },
            { status: 400 }
          );
        }

        const kendaraan = await prisma.kendaraan.create({
          data: {
            id: data.id,
            merk: data.merk,
            tipe: data.tipe,
            transmisi: data.transmisi,
            tahun: data.tahun,
            CC: data.CC,
            user: {
              connect: {
                id: data.userId
              }
            }
          }
        });

        return NextResponse.json(kendaraan);
      default:
        return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { model, id, data } = await request.json();

    if (model === 'booking') {
      const booking = await prisma.booking.update({
        where: { id: id },
        data: data
      });
      return NextResponse.json(booking);
    }

    switch (model) {
      case 'user':
        let updateData = { ...data };
        
        // Only hash password if it's being updated
        if (data.password) {
          updateData.password = await bcrypt.hash(data.password, 10);
        }

        return NextResponse.json(
          await prisma.user.update({
            where: { id: Number(id) },
            data: updateData
          })
        );
        
      case 'karyawan':
        return NextResponse.json(
          await prisma.karyawan.update({
            where: { id: Number(id) },
            data
          })
        );
      case 'sparepart':
        return NextResponse.json(
          await prisma.sparepart.update({
            where: { id: Number(id) },
            data
          })
        );
      case 'service':
        return NextResponse.json(
          await prisma.service.update({
            where: { id: Number(id) },
            data
          })
        );
      case 'riwayat':
        return NextResponse.json(
          await prisma.riwayat.update({
            where: { id: Number(id) },
            data,
            include: {
              user: true,
              karyawan: true
            }
          })
        );
      case 'kendaraan':
        return NextResponse.json(
          await prisma.kendaraan.update({
            where: { id: String(id) },
            data
          })
        );
      default:
        return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
    }
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const model = searchParams.get('model');
    const id = searchParams.get('id');

    if (!model || !id) {
      return NextResponse.json({ error: 'Missing model or id' }, { status: 400 });
    }

    switch (model) {
      case 'user':
        return NextResponse.json(
          await prisma.user.delete({
            where: { id: Number(id) }
          })
        );
      case 'karyawan':
        return NextResponse.json(
          await prisma.karyawan.delete({
            where: { id: Number(id) }
          })
        );
      case 'sparepart':
        return NextResponse.json(
          await prisma.sparepart.delete({
            where: { id: Number(id) }
          })
        );
      case 'service':
        return NextResponse.json(
          await prisma.service.delete({
            where: { id: Number(id) }
          })
        );
      case 'riwayat':
        return NextResponse.json(
          await prisma.riwayat.delete({
            where: { id: Number(id) }
          })
        );
      case 'kendaraan':
        return NextResponse.json(
          await prisma.kendaraan.delete({
            where: { id: String(id) }
          })
        );
      default:
        return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
    }
  } catch (error) {
    return handleError(error);
  }
}