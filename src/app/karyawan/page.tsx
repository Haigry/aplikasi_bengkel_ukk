"use client";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function KaryawanDashboard() {
  const { data: session } = useSession();

  const menuItems = [
    {
      title: "Service Orders",
      description: "Lihat dan kelola order service",
      href: "/karyawan/service",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      title: "Antrian Booking",
      description: "Lihat daftar antrian booking",
      href: "/karyawan/bookings",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard Karyawan
        </h1>
        <p className="text-gray-600">
          Selamat datang, {session?.user?.name}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {menuItems.map((item, i) => (
          <Link key={i} href={item.href}>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
