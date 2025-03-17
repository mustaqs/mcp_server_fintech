'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RoleBasedContent from '@/components/auth/RoleBasedContent';

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  
  // Mock data for demonstration
  const mockUsers = [
    { id: '1', username: 'johndoe', email: 'john@example.com', roles: ['user'], is_active: true },
    { id: '2', username: 'janedoe', email: 'jane@example.com', roles: ['user', 'financial_analyst'], is_active: true },
    { id: '3', username: 'adminuser', email: 'admin@example.com', roles: ['admin'], is_active: true },
    { id: '4', username: 'inactiveuser', email: 'inactive@example.com', roles: ['user'], is_active: false },
  ];

  const mockApiKeys = [
    { id: '1', name: 'Production API Key', key: '••••••••••••••••', created_at: '2023-01-15T12:00:00Z', last_used: '2023-03-10T09:45:22Z' },
    { id: '2', name: 'Development API Key', key: '••••••••••••••••', created_at: '2023-02-20T15:30:00Z', last_used: '2023-03-12T14:20:10Z' },
    { id: '3', name: 'Testing API Key', key: '••••••••••••••••', created_at: '2023-03-05T10:15:00Z', last_used: null },
  ];

  const tabs = [
    { id: 'users', name: 'Users' },
    { id: 'api_keys', name: 'API Keys' },
    { id: 'settings', name: 'System Settings' },
  ];

  return (
    <ProtectedRoute>
      <RoleBasedContent 
        allowedRoles={['admin']} 
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center p-8 max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-lg">
              <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Access Denied</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                You don't have permission to access this page. This area is restricted to administrators only.
              </p>
            </div>
          </div>
        }
      >
        <div className="py-10">
          <header>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
            </div>
          </header>
          <main>
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
              <div className="px-4 py-8 sm:px-0">
                <div className="flex flex-col md:flex-row">
                  {/* Tabs */}
                  <div className="w-full md:w-64 mb-8 md:mb-0">
                    <nav className="space-y-1" aria-label="Admin">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`${
                            activeTab === tab.id
                              ? 'bg-gray-100 text-primary-700 dark:bg-gray-800 dark:text-primary-400'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                          } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full`}
                          aria-current={activeTab === tab.id ? 'page' : undefined}
                        >
                          {tab.name}
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Content */}
                  <div className="md:ml-8 flex-1">
                    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                      {/* Users Management */}
                      {activeTab === 'users' && (
                        <div>
                          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                            <div>
                              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                User Management
                              </h3>
                              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                                Manage user accounts and permissions.
                              </p>
                            </div>
                            <button
                              type="button"
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600"
                            >
                              Add User
                            </button>
                          </div>
                          <div className="border-t border-gray-200 dark:border-gray-700">
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                  <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Username
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Roles
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                  {mockUsers.map((user) => (
                                    <tr key={user.id}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {user.username}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {user.email}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-wrap gap-1">
                                          {user.roles.map((role) => (
                                            <span 
                                              key={role} 
                                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                role === 'admin' 
                                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                                                  : role === 'financial_analyst'
                                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                              }`}
                                            >
                                              {role}
                                            </span>
                                          ))}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                          user.is_active 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}>
                                          {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                          <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                                            Edit
                                          </button>
                                          <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                            {user.is_active ? 'Deactivate' : 'Activate'}
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* API Keys Management */}
                      {activeTab === 'api_keys' && (
                        <div>
                          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                            <div>
                              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                API Keys
                              </h3>
                              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                                Manage API keys for developers.
                              </p>
                            </div>
                            <button
                              type="button"
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600"
                            >
                              Generate New Key
                            </button>
                          </div>
                          <div className="border-t border-gray-200 dark:border-gray-700">
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                  <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Key
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Created
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Last Used
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                  {mockApiKeys.map((apiKey) => (
                                    <tr key={apiKey.id}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {apiKey.name}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center">
                                          <span className="font-mono">{apiKey.key}</span>
                                          <button className="ml-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                          </button>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(apiKey.created_at).toLocaleDateString()}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {apiKey.last_used 
                                          ? new Date(apiKey.last_used).toLocaleDateString() 
                                          : 'Never used'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                          <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                                            Regenerate
                                          </button>
                                          <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                            Revoke
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* System Settings */}
                      {activeTab === 'settings' && (
                        <div>
                          <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                              System Settings
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                              Configure global system settings.
                            </p>
                          </div>
                          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
                            <div className="space-y-6">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Security Settings</h4>
                                <div className="mt-4 space-y-4">
                                  <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                      <input
                                        id="enforce_2fa"
                                        name="enforce_2fa"
                                        type="checkbox"
                                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                      />
                                    </div>
                                    <div className="ml-3 text-sm">
                                      <label htmlFor="enforce_2fa" className="font-medium text-gray-700 dark:text-gray-300">
                                        Enforce Two-Factor Authentication
                                      </label>
                                      <p className="text-gray-500 dark:text-gray-400">
                                        Require all users to set up 2FA for their accounts.
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                      <input
                                        id="password_expiry"
                                        name="password_expiry"
                                        type="checkbox"
                                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                      />
                                    </div>
                                    <div className="ml-3 text-sm">
                                      <label htmlFor="password_expiry" className="font-medium text-gray-700 dark:text-gray-300">
                                        Password Expiry
                                      </label>
                                      <p className="text-gray-500 dark:text-gray-400">
                                        Force password reset every 90 days.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">API Rate Limiting</h4>
                                <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                                  <p>Set the maximum number of API requests per minute.</p>
                                </div>
                                <div className="mt-3 sm:flex sm:items-center">
                                  <div className="max-w-xs w-full">
                                    <input
                                      type="number"
                                      name="api_rate_limit"
                                      id="api_rate_limit"
                                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                      placeholder="100"
                                      defaultValue="100"
                                    />
                                  </div>
                                  <span className="mt-2 text-sm text-gray-500 dark:text-gray-400 sm:mt-0 sm:ml-3">
                                    requests per minute
                                  </span>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">System Maintenance</h4>
                                <div className="mt-4 space-y-4">
                                  <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                      <input
                                        id="maintenance_mode"
                                        name="maintenance_mode"
                                        type="checkbox"
                                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                      />
                                    </div>
                                    <div className="ml-3 text-sm">
                                      <label htmlFor="maintenance_mode" className="font-medium text-gray-700 dark:text-gray-300">
                                        Maintenance Mode
                                      </label>
                                      <p className="text-gray-500 dark:text-gray-400">
                                        Put the system in maintenance mode. Only administrators can access the system.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600"
                                >
                                  Save Settings
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </RoleBasedContent>
    </ProtectedRoute>
  );
}
