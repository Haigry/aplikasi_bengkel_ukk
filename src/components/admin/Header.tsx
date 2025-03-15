'use client';

import { useSession, signOut } from 'next-auth/react';

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { data: session } = useSession();

  const handleLogout = () => {
    signOut({ 
      redirect: true,
      callbackUrl: '/login'
    });
  };

  return (
    <header className="bg-white shadow-sm z-20">
      <div className="h-16 px-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="text-gray-500 hover:text-gray-700 lg:hidden focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-xl font-semibold text-gray-800">
            {session?.user?.name || 'Welcome'}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
