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

const getBookings = async () => {
  return await prisma.booking.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          noTelp: true
        }
      }
    },
    orderBy: {
      date: 'desc'
    }
  });
};

const handleBookingCreate = async (data: any) => {
  const booking = await prisma.booking.create({
    data: {
      userId: data.userId,
      date: new Date(data.date),
      message: data.message,
      queue: data.queue || 1,
      status: data.status || 'PENDING',
      kendaraanId: data.kendaraanId || null
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
  return booking;
};

const handleRiwayatCreate = async (data: any) => {
  // Get sparepart details first
  const spareParts = await Promise.all(
    data.spareParts?.map(async (part: any) => {
      const sparepart = await prisma.sparepart.findUnique({
        where: { id: part.id }
      });
      return {
        sparepartId: part.id,
        quantity: part.quantity,
        harga: sparepart?.harga || 0 // Use actual sparepart price
      };
    }) || []
  );

  return await prisma.riwayat.create({
    data: {
      userId: data.userId,
      karyawanId: data.karyawanId,
      kendaraanId: data.kendaraanId,
      serviceId: data.serviceId,
      totalHarga: data.totalHarga,
      quantity: data.quantity,
      harga: data.harga,
      status: data.status || 'PENDING',
      spareParts: {
        create: spareParts
      }
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
        try {
          const bookings = await prisma.booking.findMany({
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  noTelp: true,
                  email: true
                }
              }
            },
            orderBy: [
              { date: 'desc' },
              { createdAt: 'desc' }
            ]
          });

          // Map the results to match the expected format
          const formattedBookings = bookings.map(booking => ({
            id: booking.id,
            userId: booking.userId,
            date: booking.date.toISOString(),
            message: booking.message || '',
            status: booking.status || 'PENDING',
            queue: booking.queue || 1,
            createdAt: booking.createdAt.toISOString(),
            user: {
              id: booking.user.id,
              name: booking.user.name || 'Unknown',
              noTelp: booking.user.noTelp || '',
              email: booking.user.email || ''
            }
          }));

          return NextResponse.json(formattedBookings);
        } catch (error) {
          console.error('Error fetching bookings:', error);
          return NextResponse.json({ 
            error: 'Failed to fetch bookings',
            details: error instanceof Error ? error.message : 'Unknown error'
          }, { 
            status: 500 
          });
        }

      case 'riwayat':
        try {
          const riwayatData = id 
            ? await prisma.riwayat.findUnique({
                where: { id: Number(id) },
                include: {
                  user: {
                    select: {
                      name: true,
                      email: true,
                    }
                  },
                  karyawan: {
                    select: {
                      name: true,
                    }
                  },
                  kendaraan: true,
                  service: true,
                  sparepart: true,
                  spareParts: {
                    include: {
                      sparepart: true
                    }
                  }
                }
              })
            : await prisma.riwayat.findMany({
                include: {
                  user: {
                    select: {
                      name: true,
                      email: true,
                    }
                  },
                  karyawan: {
                    select: {
                      name: true,
                    }
                  },
                  kendaraan: true,
                  service: true,
                  sparepart: true,
                  spareParts: {
                    include: {
                      sparepart: true
                    }
                  }
                },
                orderBy: {
                  createdAt: 'desc'
                }
              });

          return NextResponse.json(riwayatData);
        } catch (error) {
          console.error('Error fetching riwayat:', error);
          return handleError(error);
        }

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

export async function POST(req: Request) {
  try {
    if (!req.body) {
      return NextResponse.json({ error: 'Request body is required' }, { status: 400 });
    }

    const { model, data } = await req.json();

    if (!model || !data) {
      return NextResponse.json({ error: 'Model dan data diperlukan' }, { status: 400 });
    }

    if (model === 'booking') {
      try {
        // Validate required fields
        if (!data.userId || !data.message) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          );
        }

        // Get today's queue number
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const latestBooking = await prisma.booking.findFirst({
          where: {
            date: {
              gte: today
            }
          },
          orderBy: {
            queue: 'desc'
          }
        });

        const queueNumber = latestBooking ? latestBooking.queue + 1 : 1;

        // Create booking
        const result = await prisma.booking.create({
          data: {
            userId: Number(data.userId),
            message: String(data.message),
            date: new Date(),
            status: 'PENDING' as BookingStatus,
            queue: queueNumber,
            kendaraanId: data.kendaraanId || null
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                noTelp: true,
                email: true
              }
            }
          }
        });

        return NextResponse.json(result);
      } catch (error) {
        console.error('Error creating booking:', error);
        return NextResponse.json(
          { error: 'Failed to create booking', details: error instanceof Error ? error.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }

    // Handle other models
    switch (model) {
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
        try {
          // Start transaction
          const result = await prisma.$transaction(async (tx) => {
            // Validate required fields
            if (!data.userId || !data.karyawanId || !data.kendaraanId) {
              throw new Error('Missing required fields');
            }

            // Check stock availability first
            if (data.spareParts && Array.isArray(data.spareParts) && data.spareParts.length > 0) {
              for (const part of data.spareParts) {
                const sparepart = await tx.sparepart.findUnique({
                  where: { id: Number(part.id) }
                });
                
                if (!sparepart) {
                  throw new Error(`Sparepart with ID ${part.id} not found`);
                }
                
                if (sparepart.stok < part.quantity) {
                  throw new Error(`Insufficient stock for ${sparepart.name} (ID: ${part.id}). Available: ${sparepart.stok}, Requested: ${part.quantity}`);
                }
              }
            }

            // Create riwayat
            const riwayat = await tx.riwayat.create({
              data: {
                userId: Number(data.userId),
                karyawanId: Number(data.karyawanId),
                kendaraanId: String(data.kendaraanId),
                serviceId: data.serviceId ? Number(data.serviceId) : null,
                totalHarga: Number(data.totalHarga) || 0,
                harga: Number(data.harga) || 0,
                quantity: Number(data.quantity) || 1,
                status: data.status || 'PENDING',
                ...(data.spareParts && data.spareParts.length > 0 && {
                  spareParts: {
                    create: data.spareParts.map((part: { id: any; quantity: any; harga: any; }) => ({
                      sparepartId: Number(part.id),
                      quantity: Number(part.quantity),
                      harga: Number(part.harga || 0)
                    }))
                  }
                })
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

            // Update sparepart stock only if there are spareparts
            if (data.spareParts && Array.isArray(data.spareParts) && data.spareParts.length > 0) {
              await Promise.all(data.spareParts.map((part: { id: any; quantity: any; }) => 
                tx.sparepart.update({
                  where: { id: Number(part.id) },
                  data: {
                    stok: {
                      decrement: Number(part.quantity)
                    }
                  }
                })
              ));
            }

            return riwayat;
          });

          return NextResponse.json(result);
        } catch (error) {
          console.error('Error creating riwayat:', error);
          return NextResponse.json({
            error: 'Failed to create riwayat',
            details: error instanceof Error ? error.message : 'Unknown error'
          }, {
            status: 400
          });
        }

      case 'user':
      case 'users':
        // Validate required fields
        if (!data.email || !data.password || !data.role) {
          return NextResponse.json(
            { error: 'Email, password dan role diperlukan' },
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
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error',
      details: error instanceof Error ? error.stack : undefined
    }, { 
      status: 500 
    });
  }
}

export async function PUT(request: Request) {
  try {
    const { model, id, data } = await request.json();

    switch (model) {
      case 'riwayat':
        try {
          const result = await prisma.$transaction(async (tx) => {
            // Get current spareparts for stock adjustment
            const currentRiwayat = await tx.riwayat.findUnique({
              where: { id: Number(id) },
              include: {
                spareParts: {
                  include: { sparepart: true }
                }
              }
            });

            // Return stock from old parts
            if (currentRiwayat?.spareParts) {
              await Promise.all(
                currentRiwayat.spareParts.map(part => 
                  tx.sparepart.update({
                    where: { id: part.sparepartId },
                    data: {
                      stok: { increment: part.quantity }
                    }
                  })
                )
              );
            }

            // Delete existing spare parts relationships
            await tx.riwayatSparepart.deleteMany({
              where: { riwayatId: Number(id) }
            });

            // Update main record
            const updateData = {
              status: data.status,
              totalHarga: Number(data.totalHarga),
              serviceId: data.serviceId,
              notes: data.notes || '',
            };

            const updatedRiwayat = await tx.riwayat.update({
              where: { id: Number(id) },
              data: updateData
            });

            // Create new spare parts and decrease stock
            if (Array.isArray(data.spareParts) && data.spareParts.length > 0) {
              // First check stock availability
              for (const part of data.spareParts) {
                const sparepart = await tx.sparepart.findUnique({
                  where: { id: Number(part.sparepartId) }
                });
                
                if (!sparepart || sparepart.stok < part.quantity) {
                  throw new Error(`Insufficient stock for part ID ${part.sparepartId}`);
                }
              }

              // Create new relationships and update stock
              await Promise.all([
                // Create new relationships
                tx.riwayatSparepart.createMany({
                  data: data.spareParts.map((part: { sparepartId: number; quantity: number; harga: number; }) => ({
                    riwayatId: Number(id),
                    sparepartId: Number(part.sparepartId),
                    quantity: Number(part.quantity),
                    harga: Number(part.harga)
                  }))
                }),
                // Update stock
                ...data.spareParts.map((part: { sparepartId: number; quantity: number; }) =>
                  tx.sparepart.update({
                    where: { id: Number(part.sparepartId) },
                    data: {
                      stok: { decrement: Number(part.quantity) }
                    }
                  })
                )
              ]);
            }

            // Return complete updated record
            return await tx.riwayat.findUnique({
              where: { id: Number(id) },
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
          });

          return NextResponse.json(result);
        } catch (error) {
          console.error('Error updating riwayat:', error);
          return NextResponse.json({
            error: 'Failed to update riwayat',
            details: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 400 });
        }

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
      case 'kendaraan':
        return NextResponse.json(
          await prisma.kendaraan.update({
            where: { id: String(id) },
            data
          })
        );
      case 'booking':
        return NextResponse.json(
          await prisma.booking.update({
            where: { id: Number(id) },
            data: {
              status: data.status as BookingStatus
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  noTelp: true
                }
              }
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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const model = searchParams.get('model');
    const id = searchParams.get('id');

    if (!model || !id) {
      return NextResponse.json({ error: 'Missing model or id' }, { status: 400 });
    }

    switch (model) {
      case 'users':
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
        try {
          // First delete related spareParts
          await prisma.riwayatSparepart.deleteMany({
            where: { riwayatId: Number(id) }
          });

          // Then delete the riwayat
          const deletedRiwayat = await prisma.riwayat.delete({
            where: { id: Number(id) }
          });

          return NextResponse.json({
            success: true,
            message: 'Successfully deleted riwayat',
            data: deletedRiwayat
          });
        } catch (error) {
          console.error('Error deleting riwayat:', error);
          return NextResponse.json({ 
            error: 'Failed to delete riwayat',
            details: error instanceof Error ? error.message : 'Unknown error'
          }, { 
            status: 500 
          });
        }
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