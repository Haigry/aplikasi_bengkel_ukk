import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function generateQueueNumber(bookingDate: Date): Promise<number> {
  // Set waktu ke 00:00:00 untuk memastikan perbandingan tanggal yang akurat
  const startOfDay = new Date(bookingDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(bookingDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Cari booking terakhir pada tanggal yang sama
  const lastBooking = await prisma.booking.findFirst({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: {
      queue: 'desc',
    },
  });

  // Jika tidak ada booking pada tanggal tersebut, mulai dari 1
  // Jika ada, increment dari nomor terakhir
  return lastBooking ? lastBooking.queue + 1 : 1;
}
