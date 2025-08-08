import { UserModel } from '@/lib/models/User';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          console.log(`🔍 Authenticating user: ${credentials.email}`);

          // Find user in shared database
          const user = await UserModel.findByEmail(credentials.email as string);

          if (!user) {
            console.log(`❌ No user found with email: ${credentials.email}`);
            throw new Error('Invalid email or password');
          }

          // Verify password
          const isValidPassword = await UserModel.verifyPassword(
            credentials.password as string,
            user.password
          );

          if (!isValidPassword) {
            console.log(`❌ Invalid password for user: ${credentials.email}`);
            throw new Error('Invalid email or password');
          }

          // Update last login and track service usage
          await UserModel.updateLastLogin(user._id.toString(), 'service-a');

          console.log(`✅ User ${user.email} authenticated successfully`);

          // Return user object for JWT (password excluded)
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error('❌ Authentication error:', error);
          throw error;
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  // CRITICAL: Cookie configuration for cross-service sharing
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        domain: '.local.a.com', // ⭐ Enables sharing across all subdomains
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
    signIn: '/login',
    error: '/auth/error',
  },

  callbacks: {
    async jwt({ token, user }) {
      // Store user info in JWT when they first sign in
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        console.log(`🔄 JWT created for user: ${user.email}`);
      }
      return token;
    },

    async session({ session, token }) {
      // Send user info to client-side
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      console.log(`🔄 Redirect: ${url} (baseUrl: ${baseUrl})`);
      // Handle post-login redirects
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  events: {
    async signIn({ user }) {
      console.log(`🎉 ${user.email} signed in to Service A`);
    },
    async signOut() {
      console.log(`👋 User signed out from Service A`);
    },
  },

  debug: process.env.NODE_ENV === 'development',

  // CSRF and security settings
  useSecureCookies: process.env.NODE_ENV === 'production',

  // Trust proxy for production deployment
  trustHost: true,
});
