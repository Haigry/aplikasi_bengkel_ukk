import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!params.id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    const order = await prisma.riwayat.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            name: true,
            noTelp: true,
            alamat: true,
          },
        },
        karyawan: {
          select: {
            name: true,
          },
        },
        kendaraan: {
          select: {
            id: true,
            merk: true,
            tipe: true,
          },
        },
        service: {
          select: {
            name: true,
            harga: true,
          },
        },
        spareParts: {
          select: {
            sparepart: {
              select: {
                name: true,
                harga: true,
              },
            },
            quantity: true,
            harga: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
