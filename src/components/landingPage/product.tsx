import React from "react";

const Product: React.FC = () => {
    const features = [
        {
            title: "Manajemen Servis",
            description: "Kelola jadwal servis dan riwayat kendaraan pelanggan dengan mudah",
            icon: "🔧"
        },
        {
            title: "Inventory Control",
            description: "Pantau stok sparepart dan kelola pemesanan dengan efisien",
            icon: "📦"
        },
        {
            title: "Laporan Real-time",
            description: "Akses laporan keuangan dan analisis bisnis secara real-time",
            icon: "📊"
        },
        {
            title: "Notifikasi Otomatis",
            description: "Kirim pengingat servis dan update status ke pelanggan",
            icon: "🔔"
        }
    ];

    const services = [
        {
            title: "Service Berkala",
            description: "Perawatan rutin untuk menjaga performa optimal kendaraan Anda",
            icon: "🔧"
        },
        {
            title: "Perbaikan Mesin",
            description: "Diagnosa dan perbaikan mesin oleh teknisi berpengalaman",
            icon: "⚙️"
        },
        {
            title: "Sparepart Original",
            description: "Suku cadang asli dengan garansi resmi",
            icon: "🚗"
        },
        {
            title: "Body Repair",
            description: "Perbaikan dan pengecatan body kendaraan",
            icon: "🎨"
        }
    ];

    return (
        <>
            <section className="bg-gray-50 py-12 dark:bg-gray-800" id="features">
                <div className="max-w-screen-xl px-4 mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
                        Fitur Unggulan
                    </h2>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature, index) => (
                            <div key={index} className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-gray-700">
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section className="bg-gray-50 py-12" id="services">
                <div className="max-w-screen-xl px-4 mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Layanan Bengkel Kami
                    </h2>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {services.map((service, index) => (
                            <div key={index} className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <div className="text-4xl mb-4">{service.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {service.title}
                                </h3>
                                <p className="text-gray-600">
                                    {service.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default Product;