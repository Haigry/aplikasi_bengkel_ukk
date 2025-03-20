import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';

interface BookingCreateInput {
  userId: number;
  message: string;
  date?: Date;
  status?: BookingStatus;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!body.userId || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get today's queue number
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
    
    const nextQueue = (latestBooking?.queue || 0) + 1;
    
    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        userId: Number(body.userId),
        message: body.message,
        date: new Date(),
        queue: nextQueue,
        status: 'PENDING' as BookingStatus,
        kendaraanId: body.kendaraanId
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
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const whereClause = userId ? { userId: Number(userId) } : {};

    const bookings = await prisma.booking.findMany({
      where: whereClause,
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

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
