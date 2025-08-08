'use client';

import { useSession, signOut } from 'next-auth/react';

export default function ServiceCHomePage() {
  const { data: session, status } = useSession();

  const handleLogout = async () => {
    try {
      // Sign out and redirect to Service A login page
      await signOut({
        redirect: false,
        callbackUrl: 'http://local.a.com:3000/login',
      });

      // Force redirect to Service A login
      window.location.href =
        'http://local.a.com:3000/login?message=You have been logged out successfully';
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback redirect
      window.location.href = 'http://local.a.com:3000/login';
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Service C...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600 rounded-xl mb-6 shadow-lg">
            <span className="text-3xl font-bold text-white">C</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Service C</h1>
          <p className="text-xl text-gray-600 mb-2">
            Secondary Service - SSO Demo
          </p>
          <div className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
            Port 3002 • /c/ route
          </div>
        </div>

        {/* SSO Status Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-purple-500">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
              <svg
                className="h-5 w-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              SSO Authentication Status
            </h2>
          </div>

          {session?.user ? (
            <div className="space-y-6">
              {/* Success Banner */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-purple-500"
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
                    <h3 className="text-lg font-medium text-purple-800">
                      🎉 SSO Authentication Successful!
                    </h3>
                    <p className="text-purple-700 text-sm mt-1">
                      You were automatically authenticated via Service A without
                      needing to login again.
                    </p>
                  </div>
                </div>
              </div>

              {/* User Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700 w-20">
                      Name:
                    </span>
                    <span className="text-gray-900 font-medium">
                      {session.user.name}
                    </span>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700 w-20">
                      Email:
                    </span>
                    <span className="text-gray-900">{session.user.email}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700 w-20">
                      Service:
                    </span>
                    <span className="text-purple-600 font-medium">
                      Service C (Secondary)
                    </span>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700 w-20">
                      Method:
                    </span>
                    <span className="text-blue-600 font-medium">
                      Single Sign-On
                    </span>
                  </div>
                </div>
              </div>

              {/* Authentication Details */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  🔐 Authentication Details
                </h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• Session validated against shared MongoDB database</p>
                  <p>
                    • JWT token shared via cookie domain:{' '}
                    <code className="bg-blue-100 px-1 rounded">
                      .local.a.com
                    </code>
                  </p>
                  <p>
                    • User ID:{' '}
                    <code className="bg-blue-100 px-1 rounded">
                      {session.user.id}
                    </code>
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <svg
                    className="h-4 w-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign Out from All Services
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  Will sign you out from Service A, B, and C
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Error Banner */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-red-500"
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
                    <h3 className="text-lg font-medium text-red-800">
                      ❌ Authentication Required
                    </h3>
                    <p className="text-red-700 text-sm mt-1">
                      SSO failed. Please login on Service A first to access this
                      service.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <a
                  href="http://local.a.com/login"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Login on Service A
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Service Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            🌐 SSO Service Navigation
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Test the Single Sign-On by navigating between services. You should
            stay authenticated!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Service A */}
            <a
              href="http://local.a.com/"
              className="group block p-6 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all duration-200"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  Service A
                </h3>
                <p className="text-blue-600 text-sm font-medium">
                  Main Authentication
                </p>
                <p className="text-gray-500 text-xs mt-1">Port 3000 • /</p>
              </div>
            </a>

            {/* Service B */}
            <a
              href="http://local.a.com/b/"
              className="group block p-6 border-2 border-green-200 rounded-xl hover:border-green-400 hover:shadow-lg transition-all duration-200"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="text-white font-bold text-xl">B</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  Service B
                </h3>
                <p className="text-green-600 text-sm font-medium">
                  Secondary Service
                </p>
                <p className="text-gray-500 text-xs mt-1">Port 3001 • /b/</p>
              </div>
            </a>

            {/* Service C - Current */}
            <div className="block p-6 border-2 border-purple-400 bg-purple-50 rounded-xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  Service C
                </h3>
                <p className="text-purple-600 text-sm font-medium">
                  Current Service
                </p>
                <p className="text-gray-500 text-xs mt-1">Port 3002 • /c/</p>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Features Demo */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            🚀 Advanced SSO Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">
                🔄 Cross-Service Session Sync
              </h3>
              <p className="text-gray-600 text-sm">
                Session state is automatically synchronized across all services
                through shared JWT tokens.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">
                🛡️ Secure Cookie Sharing
              </h3>
              <p className="text-gray-600 text-sm">
                Authentication cookies are securely shared via domain-level
                configuration.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">
                📊 Centralized User Management
              </h3>
              <p className="text-gray-600 text-sm">
                All user data is managed through a single MongoDB database
                shared across services.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">
                ⚡ Production Ready
              </h3>
              <p className="text-gray-600 text-sm">
                Built with enterprise-grade patterns: connection pooling, error
                handling, and monitoring.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Information */}
        <div className="bg-gray-900 text-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🔧 Technical Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-gray-300 mb-2">
                Service Information
              </h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Next.js 15 + App Router</li>
                <li>• Auth.js v5 (next-auth@beta)</li>
                <li>• JWT session strategy</li>
                <li>• MongoDB shared database</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-300 mb-2">
                SSO Configuration
              </h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Cookie domain: .local.a.com</li>
                <li>• Session sharing across services</li>
                <li>• NGINX reverse proxy routing</li>
                <li>• Production-ready architecture</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
