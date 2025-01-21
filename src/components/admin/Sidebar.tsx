import React from 'react';
import Link from 'next/link';

interface SidebarProps {
    isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    return (
        <aside className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-30 w-64 transition-transform duration-300 transform bg-white dark:bg-gray-800 lg:translate-x-0 lg:static lg:inset-0`}>
            <div className="flex items-center justify-center mt-8">
                <div className="flex items-center">
                    {/*<img src="/logo.svg" alt="Logo" className="w-12 h-12" />*/}
                    <span className="mx-2 text-2xl font-semibold text-gray-800 dark:text-white">Dashboard Karyawan</span>
                </div>
            </div>

            <nav className="mt-10">
                <Link href="/admin/#" 
                      className="flex items-center px-6 py-2 mt-4 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="mx-3">Dashboard</span>
                </Link>
                
                <Link href="/admin/users" 
                      className="flex items-center px-6 py-2 mt-4 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="mx-3">Users</span>
                </Link>

                <Link href="/admin/products" 
                      className="flex items-center px-6 py-2 mt-4 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="mx-3">Products</span>
                </Link>

                <Link href="/admin/orders" 
                      className="flex items-center px-6 py-2 mt-4 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="mx-3">Orders</span>
                </Link>
            </nav>
        </aside>
    );
};

export default Sidebar;
