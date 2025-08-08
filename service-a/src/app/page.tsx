'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg mb-4">
          <span className="text-2xl font-bold text-white">A</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Service A - Main Authentication Hub
        </h1>
        <p className="text-xl text-gray-600">
          Single Sign-On (SSO) Demo - Authentication Service
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Authentication Status
        </h2>

        {session?.user ? (
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <svg
                className="h-5 w-5 text-green-500 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-green-700 font-medium">✅ Authenticated</p>
                <p className="text-green-600 text-sm">
                  Welcome back, {session.user.name}!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <span className="ml-2 text-gray-900">{session.user.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <span className="ml-2 text-gray-900">{session.user.email}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">User ID:</span>
                <span className="ml-2 text-gray-900 font-mono text-xs">
                  {session.user.id}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Service:</span>
                <span className="ml-2 text-gray-900">Service A (Main)</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <svg
                className="h-5 w-5 text-yellow-500 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-yellow-700 font-medium">
                  ⚠️ Not Authenticated
                </p>
                <p className="text-yellow-600 text-sm">
                  Please sign in to access all services
                </p>
              </div>
            </div>

            <div className="space-x-4">
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium inline-block transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium inline-block transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          🧪 Test SSO Across Services
        </h2>
        <p className="text-gray-600 mb-6">
          {session?.user
            ? 'Click these links to test Single Sign-On. You should be able to access all services without logging in again!'
            : 'Sign in first, then use these links to test SSO functionality.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="http://local.a.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 transition-colors"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <h3 className="font-medium text-gray-900">Service A</h3>
              <p className="text-sm text-gray-500">Main Auth Service</p>
              <p className="text-xs text-gray-400 mt-1">Port 3000</p>
            </div>
          </a>

          <a
            href="http://local.a.com/b/"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 border-2 border-green-200 rounded-lg hover:border-green-400 transition-colors"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-white font-bold">B</span>
              </div>
              <h3 className="font-medium text-gray-900">Service B</h3>
              <p className="text-sm text-gray-500">Secondary Service</p>
              <p className="text-xs text-gray-400 mt-1">Port 3001</p>
            </div>
          </a>

          <a
            href="http://local.a.com/c/"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 transition-colors"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <h3 className="font-medium text-gray-900">Service C</h3>
              <p className="text-sm text-gray-500">Secondary Service</p>
              <p className="text-xs text-gray-400 mt-1">Port 3002</p>
            </div>
          </a>
        </div>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            🔧 Development Info
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Environment:</span>
              <span className="ml-2 text-gray-900">Development</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Session Status:</span>
              <span className="ml-2 text-gray-900">{status}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Domain:</span>
              <span className="ml-2 text-gray-900">local.a.com</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Cookie Domain:</span>
              <span className="ml-2 text-gray-900">.local.a.com</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
