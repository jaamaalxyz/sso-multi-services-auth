// service-b/auth.ts & service-c/auth.ts (at project root)
// Auth.js v5 Secondary Services Configuration

import { UserModel } from '@/lib/models/User';
import NextAuth from 'next-auth';

const serviceName = process.env.SERVICE_NAME || 'unknown';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [], // No providers - these services don't handle login directly

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours - same as Service A
  },

  // CRITICAL: Same cookie configuration as Service A
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        domain: '.local.a.com', // Same domain as Service A
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
      options: {
        domain: '.local.a.com',
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        domain: '.local.a.com',
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  pages: {
    signIn: 'http://local.a.com/login', // Redirect to main service for login
    error: 'http://local.a.com/auth/error',
  },

  callbacks: {
    async jwt({ token }) {
      // Validate token with shared database
      if (token?.id) {
        try {
          const dbUser = await UserModel.findById(token.id as string);
          if (!dbUser) {
            console.log(
              `❌ User ${token.id} no longer exists, invalidating token`
            );
            // User no longer exists, invalidate token
            return {};
          }

          // Update service usage tracking
          await UserModel.updateLastLogin(dbUser._id.toString(), serviceName);

          console.log(
            `✅ Token validated for user: ${dbUser.email} on ${serviceName}`
          );

          // Return validated token
          return {
            id: dbUser._id.toString(),
            name: dbUser.name,
            email: dbUser.email,
          };
        } catch (error) {
          console.error(`❌ Token validation error on ${serviceName}:`, error);
          return {};
        }
      }
      return token;
    },

    async session({ session, token }) {
      // Send properties to the client
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      console.log(`🔄 ${serviceName} redirect: ${url}`);

      // Handle redirects - always go back to main service for auth
      if (url.includes('/api/auth/signin')) {
        return 'http://local.a.com/login';
      }

      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  events: {
    async signIn({ user }) {
      console.log(`✅ User ${user.email} accessed ${serviceName}`);
    },
    async signOut() {
      console.log(`👋 User signed out from ${serviceName}`);
    },
  },

  debug: process.env.NODE_ENV === 'development',

  trustHost: true,
});
