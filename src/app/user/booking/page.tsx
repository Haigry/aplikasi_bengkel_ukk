'use client';
import { useState, useEffect } from 'react';
import { Booking, Kendaraan } from '@prisma/client';
import { useSession } from 'next-auth/react';

export default function UserBookingPage() {
  const { data: session } = useSession();
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [userVehicles, setUserVehicles] = useState<Kendaraan[]>([]);

  // Add implementation
}
