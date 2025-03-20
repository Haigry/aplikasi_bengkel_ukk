import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const date = searchParams.get('date');

    if (!vehicleId || !date) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const bookingDate = new Date(date);
    const startOfDay = new Date(bookingDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(bookingDate.setHours(23, 59, 59, 999));

    // Check for existing booking in bookings table
    const existingBooking = await prisma.booking.findFirst({
      where: {
        AND: [
          { kendaraanId: vehicleId },
          { date: { gte: startOfDay, lt: endOfDay } },
          { NOT: { status: 'CANCELLED' } }
        ]
      },
    });

    return NextResponse.json({ exists: !!existingBooking });
  } catch (error) {
    console.error('Error checking booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
