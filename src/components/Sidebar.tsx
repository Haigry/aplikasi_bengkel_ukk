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
  UserIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const pathname = usePathname();

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: HomeIcon },
    { href: '/admin/users', label: 'Users', icon: UserGroupIcon },
    { href: '/admin/products', label: 'Sparepart', icon: WrenchScrewdriverIcon },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCartIcon },
    { href: '/admin/kendaraan', label: 'Kendaraan', icon: TruckIcon },
    { href: '/admin/karyawan', label: 'Karyawan', icon: UserIcon },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      lg:translate-x-0 lg:static
    `}>
      {/* Logo Section */}
      <div className="flex items-center justify-center p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <Image 
            src="/BENGKEL.png" 
            alt="Logo" 
            width={48} 
            height={48}
            className="w-12 h-12"
          />
          <span className="text-xl font-bold">Bengkel Admin</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`
                  flex items-center px-4 py-3 rounded-lg transition-colors duration-200
                  ${isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
        <p className="text-sm text-gray-400 text-center">
          © 2024 Bengkel System
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
