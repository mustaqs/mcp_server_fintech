'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import RoleBasedContent from '@/components/auth/RoleBasedContent';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="py-10">
      <header>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
            Dashboard
          </h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Welcome section */}
          <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Welcome, {user?.first_name} {user?.last_name}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              You are logged in as {user?.email}
            </p>
          </div>

          {/* Role-based content examples */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Content for all authenticated users */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                User Information
              </h2>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-900 dark:text-white">Username:</span> {user?.username}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-900 dark:text-white">Roles:</span> {user?.roles.join(', ')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-900 dark:text-white">Account Status:</span> {user?.is_active ? 'Active' : 'Inactive'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium text-gray-900 dark:text-white">Verification Status:</span> {user?.is_verified ? 'Verified' : 'Not Verified'}
                </p>
              </div>
            </div>

            {/* Admin-only content */}
            <RoleBasedContent 
              allowedRoles={['admin']}
              fallback={
                <div className="bg-gray-100 dark:bg-gray-700 shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    Standard User Access
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    You have standard user permissions. Admin features are not available.
                  </p>
                </div>
              }
            >
              <div className="bg-primary-50 dark:bg-primary-900 shadow rounded-lg p-6 border border-primary-200 dark:border-primary-800">
                <h2 className="text-lg font-medium text-primary-800 dark:text-primary-200">
                  Admin Controls
                </h2>
                <p className="mt-1 text-sm text-primary-600 dark:text-primary-400">
                  You have administrative privileges. You can manage users and system settings.
                </p>
                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600"
                  >
                    Manage Users
                  </button>
                </div>
              </div>
            </RoleBasedContent>
          </div>

          {/* Financial data section - only for users with 'financial_analyst' role */}
          <RoleBasedContent allowedRoles={['financial_analyst', 'admin']}>
            <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Financial Analytics
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                This section is only visible to financial analysts and administrators.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Revenue</h3>
                  <p className="mt-2 text-2xl font-semibold text-green-600 dark:text-green-400">$1,423,658</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Expenses</h3>
                  <p className="mt-2 text-2xl font-semibold text-blue-600 dark:text-blue-400">$845,239</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">Profit</h3>
                  <p className="mt-2 text-2xl font-semibold text-purple-600 dark:text-purple-400">$578,419</p>
                </div>
              </div>
            </div>
          </RoleBasedContent>
        </div>
      </main>
    </div>
  );
}
