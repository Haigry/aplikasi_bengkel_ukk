import React from "react";

const Information: React.FC = () => {
    return (
        <section className="relative overflow-hidden pt-32 pb-16 bg-gradient-to-b from-blue-50 to-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full font-medium text-sm">
                                #1 Bengkel Terpercaya
                            </span>
                            <h1 className="text-5xl font-bold text-gray-900 leading-tight lg:text-6xl">
                                Solusi Terbaik untuk <span className="text-blue-600">Perawatan Kendaraan</span> Anda
                            </h1>
                            <p className="text-lg text-gray-600">
                                Bengkel modern dengan teknisi ahli berpengalaman dan peralatan berteknologi tinggi untuk 
                                memastikan kendaraan Anda mendapat perawatan terbaik.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <a href="#services" 
                               className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white 
                                        bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30">
                                Lihat Layanan
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                                </svg>
                            </a>
                            <a href="#contact"
                               className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-gray-700 
                                        bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                                Hubungi Kami
                            </a>
                        </div>

                        <div className="grid grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">10+</div>
                                <div className="text-sm text-gray-600">Tahun Pengalaman</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">5000+</div>
                                <div className="text-sm text-gray-600">Pelanggan Puas</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">15+</div>
                                <div className="text-sm text-gray-600">Teknisi Ahli</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="relative z-10 rounded-xl overflow-hidden shadow-2xl">
                            <img src="/images/workshop-hero.jpg" alt="Bengkel Modern" 
                                 className="w-full h-[600px] object-cover" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 transform rotate-6 scale-105 rounded-xl -z-10">
                        </div>
                    </div>
                </div>
            </div>

            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-20">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>
        </section>
    );
};

export default Information;
