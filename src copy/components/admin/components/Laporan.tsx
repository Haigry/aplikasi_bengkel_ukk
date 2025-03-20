import React from "react";
import Image from "next/image";

const Laporan: React.FC = () => {
  return (
    <div className="dashboard-container p-8 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Hero Section */}
        <div className="col-span-full bg-white rounded-lg shadow-lg p-6 flex items-center">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-4">Bengkel Dashboard</h1>
            <p className="text-gray-600">Welcome to your workshop management system</p>
          </div>
          <div className="relative w-32 h-32">
            <Image
              src="/images/workshop-logo.png"
              alt="Workshop Logo"
              layout="fill"
              objectFit="contain"
              priority
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <div className="relative w-16 h-16">
              <Image
                src="/images/mechanic.png"
                alt="Mechanic"
                layout="fill"
                objectFit="contain"
              />
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-semibold">Active Mechanics</h3>
              <p className="text-2xl font-bold text-blue-600">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <div className="relative w-16 h-16">
              <Image
                src="/images/repair.png"
                alt="Ongoing Repairs"
                layout="fill"
                objectFit="contain"
              />
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-semibold">Ongoing Repairs</h3>
              <p className="text-2xl font-bold text-green-600">8</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <div className="relative w-16 h-16">
              <Image
                src="/images/completed.png"
                alt="Completed Today"
                layout="fill"
                objectFit="contain"
              />
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-semibold">Completed Today</h3>
              <p className="text-2xl font-bold text-purple-600">15</p>
            </div>
          </div>
        </div>

        {/* Workshop Schedule */}
        <div className="col-span-full lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Today's Schedule</h2>
          <div className="relative h-[300px] w-full">
            <Image
              src="/images/schedule-overview.png"
              alt="Schedule Overview"
              layout="fill"
              objectFit="contain"
            />
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center">
                <div className="relative w-10 h-10">
                  <Image
                    src="/images/activity.png"
                    alt="Activity"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">Service Completed</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Laporan;