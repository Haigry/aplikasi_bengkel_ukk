'use client';

import { SessionProvider } from 'next-auth/react';

export default function KaryawanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-100">
        <div className="flex-1">
          {children}
        </div>
      </div>
    </SessionProvider>
  );
}
