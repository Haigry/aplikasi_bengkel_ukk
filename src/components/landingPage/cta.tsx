'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const CTA: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const handleBooking = () => {
    if (session) {
      router.push('/booking');
    } else {
      router.push('/login?redirect=/booking');
    }
  };

  return (
    <section className="relative bg-blue-600 py-20">
      <div className="absolute inset-0">
        <img 
          src="/images/mechanic-bg.jpg" 
          alt="Mechanic Background" 
          className="w-full h-full object-cover opacity-10"
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          Butuh Service Kendaraan?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Dapatkan penanganan profesional untuk kendaraan Anda. 
          Kami siap memberikan pelayanan terbaik dengan teknisi berpengalaman.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={handleBooking}
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-full hover:bg-gray-100 transition-colors duration-300"
          >
            {session ? 'Booking Service Sekarang' : 'Login untuk Booking'}
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <a 
            href="tel:+6289515583710" 
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-full hover:bg-white hover:text-blue-600 transition-colors duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
            Hubungi Kami
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTA;
