import prisma from '@/lib/prisma';
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const history = await prisma.riwayat.findMany({
      where: {
        userId: parseInt(params.userId)
      },
      include: {
        kendaraan: true,
        karyawan: true,
        items: {
          include: {
            sparepart: true,
            service: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(history)
  } catch (error) {
    console.error('Error fetching history:', error)
    return NextResponse.json(
      { error: "Error fetching history" },
      { status: 500 }
    )
  }
}
