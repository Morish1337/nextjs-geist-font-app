import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      role: 'FREE' | 'VIP' | 'ADMIN';
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    username: string;
    email: string;
    role: 'FREE' | 'VIP' | 'ADMIN';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'FREE' | 'VIP' | 'ADMIN';
    username: string;
  }
}
