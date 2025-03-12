export interface UserProfile {
  id: string;
  name: string;
  email: string;
  workshops: Workshop[];
}

export interface Workshop {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

export interface DashboardData {
  user: UserProfile;
  upcomingWorkshops: Workshop[];
  pastWorkshops: Workshop[];
}

export interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GenericObject) => Promise<void>;
  data: GenericObject;
  title: string;
}

export interface GenericObject {
  [key: string]: unknown;
}

export type ErrorHandler = (error: Error) => void;

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface Booking {
  id: number;
  queue: number;
  date: string;
  message: string;
  status: BookingStatus;
  user: {
    name: string;
    email: string;
  };
}

export interface Riwayat {
  id: number;
  totalHarga: number;
  quantity: number;
  harga: number;
  userId: number;
  karyawanId: number;
  kendaraanId: string;
  serviceId?: number;
  sparepartId?: number;
  user: { name: string };
  karyawan: { name: string };
  kendaraan: { id: string; merk: string };
  service?: { name: string };
  sparepart?: { name: string };
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}