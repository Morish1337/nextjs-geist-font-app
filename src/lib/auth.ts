import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import pool from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const [users] = await pool.execute(
            'SELECT * FROM users WHERE username = ? AND status = "ACTIVE"',
            [credentials.username]
          );
          
          const user = (users as any)[0];
          
          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);
          
          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          
          // Fallback pour les tests - utilisateurs de démonstration
          const demoUsers = [
            { id: '1', username: 'admin', password: 'admin123', role: 'ADMIN', email: 'admin@finisseurhub.com' },
            { id: '2', username: 'vip_user', password: 'vip123', role: 'VIP', email: 'vip@finisseurhub.com' },
            { id: '3', username: 'free_user', password: 'free123', role: 'FREE', email: 'free@finisseurhub.com' }
          ];
          
          const demoUser = demoUsers.find(u => u.username === credentials.username);
          
          if (demoUser && demoUser.password === credentials.password) {
            return {
              id: demoUser.id,
              username: demoUser.username,
              email: demoUser.email,
              role: demoUser.role,
            };
          }
          
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as 'FREE' | 'VIP' | 'ADMIN';
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};
