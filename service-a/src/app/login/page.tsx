'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();

  // Get any messages from URL params (like after signup)
  const message = searchParams.get('message');
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log(`🔐 Attempting login for: ${email}`);

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, // Handle redirect manually for better UX
        callbackUrl: callbackUrl, // Ensure callback URL is passed
      });

      if (result?.error) {
        console.error('❌ Login error:', result.error);

        // Handle specific CSRF error
        if (result.error === 'MissingCSRF') {
          setError(
            'Security token missing. Please refresh the page and try again.'
          );
          // Optionally reload the page to get fresh CSRF token
          setTimeout(() => window.location.reload(), 2000);
        } else {
          setError(result.error);
        }
      } else if (result?.ok) {
        console.log('✅ Login successful, checking session...');

        // Add a small delay to ensure session is properly set
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Verify session was created
        const session = await getSession();
        if (session?.user) {
          console.log(`🎉 Session confirmed for: ${session.user.email}`);

          // Force refresh and redirect
          window.location.href = callbackUrl;
        } else {
          setError(
            'Login succeeded but session creation failed. Please try again.'
          );
        }
      }
    } catch (err) {
      console.error('❌ Unexpected login error:', err);
      setError(
        'An unexpected error occurred. Please refresh the page and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            One login for all services (A, B, C)
          </p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-colors"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-colors"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {/* Sign up Link */}
          <div className="text-center">
            <Link
              href="/signup"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Are you a new user? Sign up
            </Link>
          </div>
        </form>

        {/* Development Test Links */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 border-t pt-8">
            <p className="text-center text-sm text-gray-600 mb-4">
              🧪 After login, test SSO:
            </p>
            <div className="space-y-2">
              <a
                href="http://local.a.com/"
                target="_blank"
                className="block text-center text-blue-600 hover:text-blue-800 text-sm transition-colors"
              >
                → Service A Home (Main)
              </a>
              <a
                href="http://local.a.com/b/"
                target="_blank"
                className="block text-center text-green-600 hover:text-green-800 text-sm transition-colors"
              >
                → Service B Content
              </a>
              <a
                href="http://local.a.com/c/"
                target="_blank"
                className="block text-center text-purple-600 hover:text-purple-800 text-sm transition-colors"
              >
                → Service C Content
              </a>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4">
              💡 All links should work without re-login if SSO is working
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
