import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
    name?: string | null;
    email: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user']
  }
}

declare module 'next-auth/adapters' {
  interface AdapterUser {
    role: string;
  }
}
