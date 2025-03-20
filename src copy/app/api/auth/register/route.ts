import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth/password';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password, name, noTelp, alamat, NoKTP } = await request.json();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with optional fields
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        noTelp: noTelp || null,
        alamat: alamat || null,
        NoKTP: NoKTP || null,
        role: 'CUSTOMER',
      }
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        noTelp: user.noTelp,
        alamat: user.alamat,
        NoKTP: user.NoKTP,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mendaftar' },
      { status: 500 }
    );
  }
}
