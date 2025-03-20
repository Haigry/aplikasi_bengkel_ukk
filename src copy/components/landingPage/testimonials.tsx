import React from 'react';
import Image from 'next/image';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: "Ahmad Setiawan",
      role: "Pelanggan Setia",
      image: "/Testimoni/1.jpeg",
      quote: "Pelayanan bengkel sangat profesional. Mekaniknya ahli dan ramah. Saya sangat puas dengan hasil perbaikan mobil saya."
    },
    {
      name: "Siti Rahayu",
      role: "Pengusaha",
      image: "/Testimoni/2.jpeg",
      quote: "Harga transparan dan kualitas sparepart terjamin original. Sudah 3 tahun menjadi pelanggan tetap di sini."
    },
    {
      name: "Budi Santoso",
      role: "Driver Ojek Online",
      image: "/Testimoni/3.jpeg",
      quote: "Service cepat dan berkualitas. Motor saya selalu dirawat di sini karena hasilnya selalu memuaskan."
    }
  ];

  return (
    <section className="bg-gray-50 py-16" id="testimonials">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Apa Kata Mereka?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Dengarkan pengalaman pelanggan kami yang telah mempercayakan kendaraan mereka kepada bengkel kami.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center mb-6">
                <div className="relative w-16 h-16 mr-4">
                  <Image 
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="rounded-full object-cover"
                    sizes="(max-width: 64px) 100vw, 64px"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                  <p className="text-blue-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-600 italic">&ldquo;{testimonial.quote}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
