import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { auth } from '@/auth';
import SessionProvider from '@/providers/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Service A - SSO Demo',
  description: 'Main authentication service for SSO multi-service demo',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get session on server side
  const session = await auth();

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <main className="min-h-screen bg-gray-50">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
