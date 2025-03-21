'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    noTelp: '',
    alamat: '',
    NoKTP: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    noTelp: '',
    alamat: '',
    NoKTP: '',
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      noTelp: '',
      alamat: '',
      NoKTP: '',
    };

    // Validate name
    if (formData.name.length < 3) {
      newErrors.name = 'Nama minimal 3 karakter';
      isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
      isValid = false;
    }

    // Validate password
    if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
      isValid = false;
    }

    // Validate noTelp
    const phoneRegex = /^[0-9]{10,13}$/;
    if (!phoneRegex.test(formData.noTelp)) {
      newErrors.noTelp = 'Nomor telepon harus 10-13 digit';
      isValid = false;
    }

    // Validate NoKTP
    const ktpRegex = /^[0-9]{16}$/;
    if (!ktpRegex.test(formData.NoKTP)) {
      newErrors.NoKTP = 'Nomor KTP harus 16 digit';
      isValid = false;
    }

    // Validate alamat
    if (formData.alamat.length < 10) {
      newErrors.alamat = 'Alamat minimal 10 karakter';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleKTPInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, NoKTP: value });
    setErrors({ ...errors, NoKTP: '' });
  };
  
  const handleNoTelpInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, noTelp: value });
    setErrors({ ...errors, noTelp: '' });
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Mohon periksa kembali data anda');
      return;
    }

    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setErrors({
        ...errors,
        confirmPassword: 'Password tidak cocok'
      });
      toast.error('Password tidak cocok');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          noTelp: formData.noTelp,
          alamat: formData.alamat,
          NoKTP: formData.NoKTP,
          role: 'CUSTOMER' // Default role for new registrations
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Terjadi kesalahan saat registrasi');
      }

      toast.success('Registrasi berhasil! Silakan login.');
      router.push('/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-8 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img src="/BENGKEL.png" alt="Logo" className="mx-auto h-12 w-auto" />
        <h2 className="mt-4 text-center text-2xl font-bold text-gray-900">
          Daftar Akun Baru
        </h2>
        <p className="mt-1 text-center text-sm text-gray-600">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Login disini
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 shadow-xl sm:rounded-lg sm:px-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name and Email in one row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nama Lengkap
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setErrors({ ...errors, name: '' });
                  }}
                  className={`mt-1 block w-full px-3 py-1.5 border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm text-sm`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setErrors({ ...errors, email: '' });
                  }}
                  className={`mt-1 block w-full px-3 py-1.5 border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm text-sm`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Phone and KTP in one row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="noTelp" className="block text-sm font-medium text-gray-700">
                  Nomor Telepon
                </label>
                <input
                  id="noTelp"
                  name="noTelp"
                  type="tel"
                  inputMode='numeric'
                  pattern="[0-9]*"
                  maxLength={13}
                  required
                  value={formData.noTelp}
                  onChange={handleNoTelpInput}
                  className={`mt-1 block w-full px-3 py-1.5 border ${
                    errors.noTelp ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm text-sm`}
                />
                {errors.noTelp && (
                  <p className="mt-1 text-xs text-red-500">{errors.noTelp}</p>
                )}
              </div>
              <div>
                <label htmlFor="NoKTP" className="block text-sm font-medium text-gray-700">
                  Nomor KTP
                </label>
                <input
                  id="NoKTP"
                  name="NoKTP"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={16}
                  required
                  value={formData.NoKTP}
                  onChange={handleKTPInput}
                  className={`mt-1 block w-full px-3 py-1.5 border ${
                    errors.NoKTP ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm text-sm`}
                />
                {errors.NoKTP && (
                  <p className="mt-1 text-xs text-red-500">{errors.NoKTP}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="alamat" className="block text-sm font-medium text-gray-700">
                Alamat
              </label>
              <textarea
                id="alamat"
                name="alamat"
                inputMode='text'
                required
                value={formData.alamat}
                onChange={(e) => {
                  setFormData({ ...formData, alamat: e.target.value });
                  setErrors({ ...errors, alamat: '' });
                }}
                rows={2}
                className={`mt-1 block w-full px-3 py-1.5 border ${
                  errors.alamat ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm text-sm`}
              />
              {errors.alamat && (
                <p className="mt-1 text-xs text-red-500">{errors.alamat}</p>
              )}
            </div>

            {/* Password and Confirm Password in one row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      setErrors({ ...errors, password: '' });
                    }}
                    className={`block w-full px-3 py-1.5 border ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm text-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2 flex items-center"
                  >
                    <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d={showPassword 
                          ? "M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                          : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        }
                      />
                    </svg>
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                )}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Konfirmasi Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value });
                      setErrors({ ...errors, confirmPassword: '' });
                    }}
                    className={`block w-full px-3 py-1.5 border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm text-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-2 flex items-center"
                  >
                    <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d={showConfirmPassword 
                          ? "M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                          : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        }
                      />
                    </svg>
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Memproses...' : 'Daftar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}