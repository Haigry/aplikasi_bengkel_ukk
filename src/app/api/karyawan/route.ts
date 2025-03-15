import { NextResponse } from 'next/server';
import { PrismaClient, Booking, Riwayat, BookingStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface BookingWithDetails extends Booking {
  user: {
    name: string;
  };
  kendaraan?: {
    merk: string;
    id: string;
  };
}

interface RiwayatWithDetails extends Riwayat {
  user: {
    name: string;
  };
  service: {
    name: string;
  } | null;
}

export async function GET() {
  try {
    // Fetch statistics from the database
    const [bookings, riwayat] = await Promise.all([
      prisma.booking.findMany({
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      }),
      prisma.riwayat.findMany({
        include: {
          user: {
            select: {
              name: true,
            },
          },
          service: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      totalServices: riwayat.length,
      pendingBookings: bookings.filter(b => b.status === 'PENDING').length,
      completedOrders: riwayat.length, // Since riwayat represents completed orders
      todayAppointments: bookings.filter(b => {
        const bookingDate = new Date(b.date);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate.getTime() === today.getTime();
      }).length,
      recentBookings: bookings
        .slice(0, 5)
        .map(booking => ({
          id: booking.id,
          date: booking.date,
          status: booking.status,
          user: {
            name: (booking as BookingWithDetails).user.name
          }
        }))
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
