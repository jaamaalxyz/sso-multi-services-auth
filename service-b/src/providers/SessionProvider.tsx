// Client component to wrap the app with NextAuth session

'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';

interface SessionProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

export default function SessionProvider({
  children,
  session,
}: SessionProviderProps) {
  return (
    <NextAuthSessionProvider
      session={session}
      // Refetch session every 5 minutes to keep it fresh
      refetchInterval={5 * 60}
      // Refetch session when window gets focus (user comes back to tab)
      refetchOnWindowFocus={true}
      // Base URL for auth (important for secondary services)
      basePath="/api/auth"
    >
      {children}
    </NextAuthSessionProvider>
  );
}
