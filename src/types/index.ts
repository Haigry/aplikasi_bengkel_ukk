import { User as PrismaUser, Role, Kendaraan, Service, Sparepart, Karyawan, Booking as PrismaBooking } from '@prisma/client';

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

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'PROCESS';

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
  service?: { name: string } | null;
  sparepart?: { name: string } | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface UserFormData {
  name?: string;
  email: string;
  password?: string;
  noTelp?: string;
  alamat?: string;
  NoKTP?: string;
  role: Role;
}

export interface KaryawanFormData {
  name: string;
  email: string;
  position: string;
  noTelp?: string;
  alamat?: string;
  NoKTP?: string;
  password: string;
}

export interface BookingFormData {
  user: {
    name: string;
    email: string;
    noTelp: string;
    alamat?: string;
    NoKTP?: string;
    password: string;
    role: Role;
  };
  kendaraan: {
    id: string;
    merk: string;
    tipe: string;
    transmisi: string;
    tahun: number;
    CC: number;
  };
  booking: {
    date: string;
    message: string;
  };
}

export interface BookingWithDetails extends Booking {
  user: {
    name: string;
    email: string;
    noTelp: string;
  };
  kendaraan?: Kendaraan;
  service?: Service;
}

export interface UserWithRole {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Order {
  createdAt: string | number | Date;
  id: number;
  totalHarga: number;
  quantity: number;
  harga: number;
  userId: number;
  karyawanId: number;
  kendaraanId: string;
  serviceId?: number;
  spareParts: Array<{
    id?: number;
    riwayatId: number;
    sparepartId: number;
    quantity: number;
    harga: number;
    sparepart: {
      id: number;
      name: string;
      harga: number;
      stok: number;
    };
  }>;
  bookingId?: number | null; // Add this field
  status: BookingStatus;
  notes?: string;
  jenisMesin?: string;
  kilometer?: number;
  user: {
    [x: string]: ReactNode; name: string 
};
  karyawan: { name: string };
  kendaraan: {
    [x: string]: ReactNode; id: string; merk: string 
};
  service?: {
    [x: string]: any; name: string 
};
  sparepart?: { name: string };
}

// Add this new interface
export interface OrderUpdateData {
  id: number;
  status: BookingStatus;
  totalHarga: number;
  serviceId: number | null;
  notes: string;
  spareParts: Array<{
    sparepartId: number;
    quantity: number;
    harga: number;
  }>;
}

export interface OrderFormData {
  userId: number;
  karyawanId: number;
  kendaraanId: string;
  serviceId?: number;
  spareParts: SelectedSparepart[];
  quantity: number;
  harga: number;
}

export interface SelectedSparepart {
  id: number;
  quantity: number;
}

export interface ServiceHistory {
  id: number;
  totalHarga: number;
  quantity: number;
  harga: number;
  createdAt: string;
  status: BookingStatus; // Add this for status checking
  user: {
    name: string;
    email: string;
  };
  karyawan: {
    name: string;
  };
  kendaraan: {
    merk: string;
    tipe: string;
    noPolisi?: string;
    id: string; // Add this to ensure we always have an identifier
  };
  service?: {
    [x: string]: any;
    name: string;
    description: string;
    harga: number; // Add this line to include service price
  };
  spareParts: {
    sparepart: {
      name: string;
      harga: number; // Add this line to include sparepart price
    };
    quantity: number;
    harga: number;
  }[];
}

interface RiwayatSparepart {
  id: number;
  riwayatId: number;
  sparepartId: number;
  quantity: number;
  harga: number;
  sparepart: Sparepart;
}

export interface TransactionWithRelations {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  harga: number;
  karyawanId: number;
  kendaraanId: string;
  totalHarga: number;
  quantity: number;
  serviceId: number | null;
  sparepartId: number | null;
  bookingId: number | null;
  status: BookingStatus;
  user: {
    name: string;
  };
  karyawan: {
    name: string;
  };
  kendaraan: {
    id: string;
    merk: string;
  };
  service?: {
    name: string;
    harga: number;
  } | null;
  sparepart?: {
    name: string;
    harga: number;
  } | null;
  spareParts: RiwayatSparepart[];
}