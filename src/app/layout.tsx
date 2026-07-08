import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { PublicDataProvider } from '@/context/PublicDataContext';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'Arial', 'sans-serif'],
});

export const metadata: Metadata = {
  title: 'Hackathon MPR RI 2026',
  description: 'Platform lomba coding nasional',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <AuthProvider>
          <PublicDataProvider>
            {children}
          </PublicDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}