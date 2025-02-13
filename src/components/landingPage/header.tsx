'use client';
import { useState, useEffect } from "react";
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const HeaderPage: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      toast.success('Berhasil logout');
      window.location.href = '/login';
    } catch (error) {
      toast.error('Gagal logout');
    }
  };

  const handleDashboard = () => {
    if (session?.user?.role === 'ADMIN') {
      router.push('/admin');
    }
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo section */}
          <Link href="/" className="flex items-center space-x-3">
            <img src="/BENGKEL.png" alt="Bengkel Pro" className="h-10" />
            <div>
              <h1 className="text-xl font-bold text-blue-900">BengkelPro</h1>
              <p className="text-sm text-blue-600">Professional Auto Service</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink href="#services">Layanan</NavLink>
            <NavLink href="#about">Tentang Kami</NavLink>
            <NavLink href="#gallery">Galeri</NavLink>
            <NavLink href="#contact">Kontak</NavLink>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {session ? (
              session.user?.role === 'ADMIN' ? (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleDashboard}
                    className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
                  >
                    Admin Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/customer/booking"
                    className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
                  >
                    Booking Service
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700"
                  >
                    Logout
                  </button>
                </div>
              )
            ) : (
              <Link 
                href="/login"
                className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 
                          transition-all duration-300 shadow-lg shadow-blue-600/30"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

const NavLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a href={href} className="text-gray-700 hover:text-blue-600 transition-all duration-300">
    {children}
  </a>
);

export default HeaderPage;