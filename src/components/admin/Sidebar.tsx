'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  HomeIcon, 
  UserGroupIcon, 
  WrenchScrewdriverIcon,
  ShoppingCartIcon,
  TruckIcon,
  UserIcon,
  QueueListIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}
const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const pathname = usePathname();

  const menuItems = [
    { href: '/admin/', label: 'Dashboard', icon: HomeIcon },
    { href: '/admin/users', label: 'Users', icon: UserGroupIcon },
    { href: '/admin/products', label: 'Sparepart', icon: WrenchScrewdriverIcon },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCartIcon },
    { href: '/admin/antrian', label: 'booking', icon: QueueListIcon },
    { href: '/admin/kendaraan', label: 'Kendaraan', icon: TruckIcon },
    { href: '/admin/karyawan', label: 'Karyawan', icon: UserIcon },
  ];

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-30
      w-64 h-screen bg-gray-900 text-white
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      lg:translate-x-0
      flex flex-col
    `}>
      {/* Logo Section */}
      <div className="flex items-center justify-center h-16 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <Image 
            src="/BENGKEL.png" 
            alt="Logo" 
            width={50} 
            height={50}
            className=""
          />
          <span className="text-lg font-bold">Dashboard Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`
                  flex items-center px-4 py-2.5 rounded-lg
                  transition-colors duration-200
                  ${isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <p className="text-sm text-gray-400 text-center">
          © 2024 Bengkel System
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;