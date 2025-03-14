import { NextResponse } from 'next/server';
import { PrismaClient, Prisma, Role, BookingStatus } from '@prisma/client'
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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

    switch (model) {
      case 'users':
        try {
          const whereClause = role ? 
            { role: role as Role } : 
            {};
          const userSelect = {
            id: true,
            email: true,
            name: true,
            noTelp: true,
            alamat: true,
            NoKTP: true,
            role: true,
            createdAt: true,
            updatedAt: true
          };

          const result = id ? 
            await prisma.user.findUnique({
              where: { id: Number(id) },
              select: {
                ...userSelect,
                karyawan: true,
                kendaraan: true,
              }
            })
            : await prisma.user.findMany({
              where: whereClause,
              select: userSelect
            });

          if (id && !result) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
          }

          return NextResponse.json(result);
        } catch (error) {
          console.error('Error fetching users:', error);
          return handleError(error);
        }

      case 'karyawan':
        return NextResponse.json(
          id ?
            await prisma.karyawan.findUnique({
              where: { id: Number(id) },
              include: {
                user: true,
                transaksi: true
              }
            })
          : await prisma.karyawan.findMany({
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    noTelp: true
                  }
                }
              }
            })
        );

      case 'kendaraan':
        return NextResponse.json(
          id ?
            await prisma.kendaraan.findUnique({
              where: { id: String(id) },
              include: {
                user: true,
                transaksi: true
              }
            })
          : await prisma.kendaraan.findMany({
              include: {
                user: {
                  select: {
                    name: true,
                    noTelp: true
                  }
                }
              }
            })
        );

      case 'service':
        return NextResponse.json(
          id ?
            await prisma.service.findUnique({
              where: { id: Number(id) },
              include: {
                transaksi: {
                  include: {
                    user: {
                      select: {
                        name: true,
                        noTelp: true
                      }
                    }
                  }
                }
              }
            })
          : await prisma.service.findMany({
              include: {
                transaksi: {
                  include: {
                    user: {
                      select: {
                        name: true,
                        noTelp: true
                      }
                    }
                  }
                }
              },
              orderBy: {
                name: 'asc'
              }
            })
        );

      case 'sparepart':
        return NextResponse.json(
          id ?
            await prisma.sparepart.findUnique({
              where: { id: Number(id) },
              include: {
                transaksi: true
              }
            })
          : await prisma.sparepart.findMany()
        );

      case 'booking':
        return NextResponse.json(
          id ?
            await prisma.booking.findUnique({
              where: { id: Number(id) },
              include: {
                user: {
                  select: {
                    name: true,
                    noTelp: true,
                    email: true
                  }
                }
              }
            })
          : await prisma.booking.findMany({
              include: {
                user: {
                  select: {
                    name: true,
                    noTelp: true,
                    email: true
                  }
                }
              },
              orderBy: {
                date: 'desc'
              }
            })
        );

      case 'riwayat':
        return NextResponse.json(
          id ?
            await prisma.riwayat.findUnique({
              where: { id: Number(id) },
              include: {
                user: true,
                karyawan: true,
                kendaraan: true,
                service: true,
                sparepart: true,
                riwayatLaporan: true
              }
            })
          : await prisma.riwayat.findMany({
              include: {
                user: {
                  select: {
                    name: true,
                    noTelp: true
                  }
                },
                karyawan: true,
                kendaraan: true,
                service: true,
                sparepart: true
              }
            })
        );

      case 'laporan':
        return NextResponse.json(
          id ?
            await prisma.laporan.findUnique({
              where: { id: Number(id) },
              include: {
                riwayatLaporan: {
                  include: {
                    riwayat: true
                  }
                }
              }
            })
          : await prisma.laporan.findMany({
              include: {
                riwayatLaporan: {
                  include: {
                    riwayat: {
                      include: {
                        user: true,
                        service: true,
                        sparepart: true
                      }
                    }
                  }
                }
              },
              orderBy: {
                tanggal: 'desc'
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

    switch (model) {
      case 'booking':
        if (!data.userId || !data.date || !data.message) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          );
        }
        
        const lastBooking = await prisma.booking.findFirst({
          orderBy: { queue: 'desc' }
        });
        
        const booking = await prisma.booking.create({
          data: {
            userId: data.userId,
            date: new Date(data.date),
            message: data.message,
            queue: (lastBooking?.queue ?? 0) + 1,
            status: data.status as BookingStatus ?? 'PENDING'
          }
        });
        return NextResponse.json(booking);

      case 'laporan':
        const laporan = await prisma.laporan.create({
          data: {
            tanggal: new Date(data.tanggal),
            periode: data.periode,
            omset: data.omset,
            jumlahServis: data.jumlahServis,
            jumlahSparepart: data.jumlahSparepart,
            totalTransaksi: data.totalTransaksi,
            riwayatLaporan: {
              create: data.riwayatIds.map((riwayatId: number) => ({
                riwayatId
              }))
            }
          }
        });
        return NextResponse.json(laporan);

      case 'karyawan':
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

      // Validate sparepart data
      case 'sparepart':
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

      case 'riwayat':
        const riwayat = await prisma.riwayat.create({
          data: {
            userId: data.userId,
            karyawanId: data.karyawanId,
            kendaraanId: data.kendaraanId,
            serviceId: data.serviceId,
            // Handle multiple parts in a transaction
            spareParts: {
              create: data.spareParts.map((part: { id: any; quantity: any; harga: any; }) => ({
                sparepartId: part.id,
                quantity: part.quantity,
                harga: part.harga
              }))
            },
            totalHarga: data.totalHarga,
            harga: data.harga
          },
          include: {
            user: true,
            karyawan: true,
            kendaraan: true,
            service: true,
            spareParts: {
              include: {
                sparepart: true
              }
            }
          }
        });
        
        // Update sparepart stock
        await Promise.all(data.spareParts.map((part: { id: any; quantity: any; }) => 
          prisma.sparepart.update({
            where: { id: part.id },
            data: {
              stok: {
                decrement: part.quantity
              }
            }
          })
        ));
      
        return NextResponse.json(riwayat);

      case 'user':
      case 'users':
        // Validate required fields
        if (!data.email || !data.password || !data.role) {
          return NextResponse.json(
            { error: 'Email, password and role are required' },
            { status: 400 }
          );
        }

        // Hash password before creating user
        const hashedPassword = await bcrypt.hash(data.password, 10);
        
        const userData = {
          email: data.email,
          password: hashedPassword,
          role: data.role,
          name: data.name || null,
          noTelp: data.noTelp || null,
          alamat: data.alamat || null,
          NoKTP: data.NoKTP || null
        };

        const newUser = await prisma.user.create({ 
          data: userData,
          select: {
            id: true,
            email: true,
            name: true,
            noTelp: true,
            alamat: true,
            NoKTP: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        });

        return NextResponse.json(newUser);

      case 'service':
        // Validate service data
        if (!data.name || data.harga === undefined) {
          return NextResponse.json(
            { error: 'Name and price are required' },
            { status: 400 }
          );
        }

        const service = await prisma.service.create({
          data: {
            name: data.name,
            description: data.description,
            harga: Number(data.harga)
          },
          include: {
            transaksi: true
          }
        });

        return NextResponse.json(service);
      case 'kendaraan':
        // Validate kendaraan data
        if (!data.id || !data.merk || !data.userId) {
          return NextResponse.json(
            { error: 'Missing required fields (id, merk, userId)' },
            { status: 400 }
          );
        }

        try {
          const kendaraan = await prisma.kendaraan.create({
            data: {
              id: String(data.id), // Ensure id is string
              merk: data.merk,
              tipe: data.tipe || null,
              transmisi: data.transmisi || null,
              tahun: data.tahun ? Number(data.tahun) : 0,
              CC: data.CC ? Number(data.CC) : 0,
              userId: Number(data.userId), // Ensure userId is number
            }
          });
          return NextResponse.json(kendaraan);
        } catch (error) {
          console.error('Kendaraan creation error:', error);
          return NextResponse.json(
            { error: 'Failed to create kendaraan', details: error },
            { status: 400 }
          );
        }

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
        // Validate service data
        if (!data.name || data.harga === undefined) {
          return NextResponse.json(
            { error: 'Name and price are required' },
            { status: 400 }
          );
        }

        return NextResponse.json(
          await prisma.service.update({
            where: { id: Number(id) },
            data: {
              name: data.name,
              description: data.description,
              harga: Number(data.harga)
            },
            include: {
              transaksi: true
            }
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
        // Check if service is being used in any transactions
        const serviceInUse = await prisma.riwayat.findFirst({
          where: { serviceId: Number(id) }
        });

        if (serviceInUse) {
          return NextResponse.json(
            { error: 'Cannot delete service that is being used in transactions' },
            { status: 400 }
          );
        }

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