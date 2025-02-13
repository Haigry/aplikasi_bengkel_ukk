import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    karyawanId?: number;
  }

  interface Session {
    user: {
      id: number;
      email: string;
      name: string;
      role: string;
      karyawanId: number;
    }
  }
}
