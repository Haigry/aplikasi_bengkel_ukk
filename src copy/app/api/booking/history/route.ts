import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: Number(userId)
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            noTelp: true
          }
        },
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching booking history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking history' },
      { status: 500 }
    );
  }
}
