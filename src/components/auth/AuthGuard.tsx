'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!user || !token) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(user);
    if (!allowedRoles.includes(userData.role)) {
      switch (userData.role) {
        case 'ADMIN':
          router.push('/admin');
          break;
        case 'KARYAWAN':
          router.push('/karyawan');
          break;
        case 'CUSTOMER':
          router.push('/');
          break;
        default:
          router.push('/');
      }
    }
  }, [allowedRoles, router]);

  return <>{children}</>;
};

export default AuthGuard;
