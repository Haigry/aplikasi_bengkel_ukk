import { NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';
export async function POST(req: Request) {
  try {
    const { 
      bookingId, 
      karyawanId, 
      kendaraanId, 
      totalHarga,
      quantity,
      harga,
      serviceId,
      sparepartId 
    } = await req.json();

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking tidak ditemukan' }, { status: 404 });
    }

    // Create riwayat with the new schema
    const riwayat = await prisma.riwayat.create({
      data: {
        userId: booking.userId,
        karyawanId,
        kendaraanId,
        totalHarga,
        quantity,
        harga,
        serviceId,
        sparepartId,
      }
    });

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CONFIRMED }
    });

    return NextResponse.json({
      success: true,
      data: riwayat
    });

  } catch (error) {
    console.error('Create riwayat error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem' },
      { status: 500 }
    );
  }
}
