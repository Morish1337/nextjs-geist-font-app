import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/ui/BottomNav';
import AuthProvider from '@/components/providers/AuthProvider';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'FinisseurHub - Communauté Premium',
  description: 'La plateforme communautaire premium pour les finisseurs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.variable} font-sans bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white min-h-screen antialiased`}>
        <AuthProvider>
          <main className="pb-20 min-h-screen">
            {children}
          </main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
