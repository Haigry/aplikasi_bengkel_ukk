import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get total services from Riwayat
    const totalServices = await prisma.riwayat.count({
      where: {
        serviceId: { not: null }
      }
    });
    
    // Get pending bookings
    const pendingBookings = await prisma.booking.count({
      where: { status: 'PENDING' }
    });
    
    // Get completed orders from Riwayat
    const completedOrders = await prisma.riwayat.count({
      where: { status: 'COMPLETED' }
    });
    
    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayAppointments = await prisma.booking.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });
    
    // Get recent bookings with user and vehicle info
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        user: {
          select: { name: true }
        },
        kendaraan: {
          select: { 
            id: true,
            merk: true,
          }
        }
      }
    });
    
    // Get recent vehicles with their last service
    const recentVehicles = await prisma.kendaraan.findMany({
      take: 3,
      include: {
        booking: {
          take: 1,
          orderBy: {
            date: 'desc'
          }
        },
        transaksi: {
          take: 1,
          where: { 
            serviceId: { 
              not: null 
            } 
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    // Format vehicle data
    const formattedVehicles = recentVehicles.map(vehicle => ({
      id: vehicle.id,
      merk: vehicle.merk,
      model: vehicle.tipe,
      tahun: vehicle.tahun.toString(),
      nopol: vehicle.id,
      lastService: vehicle.transaksi[0]?.createdAt || vehicle.booking[0]?.date || null
    }));

    return NextResponse.json({
      totalServices,
      pendingBookings,
      completedOrders,
      todayAppointments,
      recentBookings,
      recentVehicles: formattedVehicles
    });

  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data dashboard' },
      { status: 500 }
    );
  }
}
