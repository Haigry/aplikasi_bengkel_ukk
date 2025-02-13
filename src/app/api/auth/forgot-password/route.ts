import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Cek apakah email ada
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Email tidak ditemukan' },
        { status: 404 }
      );
    }

    // Generate token reset password
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 jam

    // Simpan token ke database
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Di sini Anda bisa menambahkan logika pengiriman email
    // Untuk demo, kita hanya return success
    return NextResponse.json({
      message: 'Link reset password telah dikirim'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan internal' },
      { status: 500 }
    );
  }
}
