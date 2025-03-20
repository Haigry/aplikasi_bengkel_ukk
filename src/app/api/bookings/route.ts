import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { date, message } = await req.json();
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check existing booking
    const existingBooking = await prisma.booking.findFirst({
      where: {
        userId: user.id,
        date: bookingDate,
        status: BookingStatus.PENDING
      }
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Anda sudah memiliki booking pada tanggal yang sama' },
        { status: 400 }
      );
    }

    // Get queue number
    const lastBooking = await prisma.booking.findFirst({
      where: {
        date: bookingDate
      },
      orderBy: {
        queue: 'desc'
      }
    });

    const queue = lastBooking ? lastBooking.queue + 1 : 1;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        date: bookingDate,
        message,
        queue,
        status: BookingStatus.PENDING
      }
    });

    return NextResponse.json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    );
  }
}
