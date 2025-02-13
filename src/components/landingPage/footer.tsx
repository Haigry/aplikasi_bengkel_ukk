import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
    const footerLinks = {
        layanan: [
            { text: 'Service Berkala', href: '#services' },
            { text: 'Service Berat', href: '#services' },
            { text: 'Body Repair', href: '#services' },
            { text: 'Cat & Poles', href: '#services' },
        ],
        bengkel: [
            { text: 'Tentang Kami', href: '#about' },
            { text: 'Tim Mekanik', href: '#team' },
            { text: 'Katalog Sparepart', href: '#catalog' },
            { text: 'Garansi Service', href: '#warranty' },
        ],
        informasi: [
            { text: 'Jam Operasional', href: '#hours' },
            { text: 'Lokasi Bengkel', href: '#location' },
            { text: 'Harga Service', href: '#pricing' },
            { text: 'FAQ', href: '#faq' },
        ]
    };

    const operationalHours = [
        { days: 'Senin - Jumat', hours: '08:00 - 17:00' },
        { days: 'Sabtu', hours: '08:00 - 15:00' },
        { days: 'Minggu', hours: 'Tutup' }
    ];

    return (
        <footer className="bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Main Footer */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div>
                        <div className="flex items-center mb-6">
                            <img src="/BENGKEL.png" alt="Bengkel Logo" className="h-10 w-auto mr-3" />
                            <div>
                                <h2 className="text-xl font-bold text-white">Bengkel Sejahtera</h2>
                                <p className="text-sm text-blue-400">Solusi Kendaraan Anda</p>
                            </div>
                        </div>
                        <div className="text-gray-400 space-y-4">
                            <p>Jl. Raya Utama No. 123<br />Kota Anda, 12345</p>
                            <div>
                                <p className="font-semibold text-white">Jam Operasional:</p>
                                {operationalHours.map((schedule, index) => (
                                    <p key={index} className="text-sm">
                                        {schedule.days}: <span className="text-blue-400">{schedule.hours}</span>
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h3 className="text-white font-semibold mb-4 uppercase">
                                {title}
                            </h3>
                            <ul className="space-y-3">
                                {links.map((link, index) => (
                                    <li key={index}>
                                        <a 
                                            href={link.href}
                                            className="text-gray-400 hover:text-blue-400 transition-colors"
                                        >
                                            {link.text}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Contact Bar */}
                <div className="mt-12 pt-8 border-t border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-6">
                            <a href="tel:+6281234567890" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                </svg>
                                (021) 1234-5678
                            </a>
                            <a href="https://wa.me/6281234567890" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-6.627-5.373-12-12-12zm.414 16.998c-1.168 0-2.287-.364-3.154-.984l-3.26.936.936-3.26c-.62-.867-.984-1.986-.984-3.154 0-3.309 2.691-6 6-6s6 2.691 6 6-2.691 6-6 6z"/>
                                </svg>
                                WhatsApp
                            </a>
                        </div>
                        <p className="text-gray-500 text-sm">
                            © {new Date().getFullYear()} Bengkel Sejahtera. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;