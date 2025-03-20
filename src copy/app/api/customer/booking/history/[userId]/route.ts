import { prisma } from '@/lib/prisma';
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: Number(params.userId)
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(bookings || []);
  } catch (error) {
    console.error('Error fetching booking history:', error);
    return NextResponse.json([]);
  }
}
