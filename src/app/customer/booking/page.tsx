import BookingForm from "@/components/booking/BookingForm";

export default function Booking() {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 overflow-hidden">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  <span className="text-blue-600">Booking</span> Service
                </h1>
                <p className="mt-2 text-gray-600">
                  Isi form di bawah untuk membuat janji service kendaraan Anda
                </p>
              </div>
            </div>
            
            <BookingForm />
          </div>
        </div>
      </div>
    </div>
  );
}