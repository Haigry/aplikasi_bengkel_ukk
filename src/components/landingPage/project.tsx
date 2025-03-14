import React from "react";

const Project: React.FC = () => {
    return (
        <section className="bg-white dark:bg-gray-900">
            <div className="max-w-screen-xl px-4 py-8 mx-auto space-y-12 lg:space-y-20 lg:py-24 lg:px-6">
                {/* First Feature Section */}
                <div className="items-center gap-8 lg:grid lg:grid-cols-2 xl:gap-16">
                    <div className="text-gray-500 sm:text-lg dark:text-gray-400">
                        <h2 className="mb-4 text-3xl font-extrabold text-gray-900 dark:text-white">
                            Manajemen Bengkel yang Lebih Efisien
                        </h2>
                        <p className="mb-8 font-light lg:text-xl">
                            Optimalkan operasional bengkel Anda dengan sistem manajemen yang terintegrasi. 
                            Tingkatkan efisiensi dan produktivitas dengan fitur-fitur canggih kami.
                        </p>
                        <ul className="space-y-5 border-t border-gray-200 my-7 dark:border-gray-700">
                            <li className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                                <span className="text-base font-medium text-gray-900 dark:text-white">
                                    Antrian service yang terorganisir
                                </span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                                <span className="text-base font-medium text-gray-900 dark:text-white">
                                    Manajemen stok sparepart real-time
                                </span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                                <span className="text-base font-medium text-gray-900 dark:text-white">
                                    Pelacakan progress service
                                </span>
                            </li>
                        </ul>
                    </div>
                    <img className="hidden w-full mb-4 rounded-lg lg:mb-0 lg:flex" 
                         src="/efficient.jpg" 
                         alt="dashboard feature"/>
                </div>

                {/* Second Feature Section */}
                <div className="items-center gap-8 lg:grid lg:grid-cols-2 xl:gap-16">
                    <img className="hidden w-full mb-4 rounded-lg lg:mb-0 lg:flex" 
                         src="/user_experience.jpg" 
                         alt="feature image"/>
                    <div className="text-gray-500 sm:text-lg dark:text-gray-400">
                        <h2 className="mb-4 text-3xl font-extrabold text-gray-900 dark:text-white">
                            Tingkatkan Kepuasan Pelanggan
                        </h2>
                        <p className="mb-8 font-light lg:text-xl">
                            Berikan pengalaman service terbaik untuk pelanggan Anda dengan sistem 
                            notifikasi otomatis dan pelacakan status service yang transparan.
                        </p>
                        <ul className="space-y-5 border-t border-gray-200 my-7 dark:border-gray-700">
                            <li className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                                <span className="text-base font-medium text-gray-900 dark:text-white">
                                    Notifikasi status service otomatis
                                </span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                                <span className="text-base font-medium text-gray-900 dark:text-white">
                                    Riwayat service lengkap
                                </span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                                <span className="text-base font-medium text-gray-900 dark:text-white">
                                    Sistem pengingat service berkala
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Project;