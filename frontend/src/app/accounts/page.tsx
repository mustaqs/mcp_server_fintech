'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Mock account data
const mockAccounts = [
  {
    id: '1',
    accountNumber: '1234567890',
    accountName: 'Primary Checking',
    balance: 5280.42,
    currency: 'USD',
    type: 'checking',
    status: 'active',
    lastTransaction: '2023-03-15T10:30:00Z',
  },
  {
    id: '2',
    accountNumber: '0987654321',
    accountName: 'Savings Account',
    balance: 12750.89,
    currency: 'USD',
    type: 'savings',
    status: 'active',
    lastTransaction: '2023-03-10T14:45:00Z',
  },
  {
    id: '3',
    accountNumber: '5678901234',
    accountName: 'Investment Portfolio',
    balance: 34250.00,
    currency: 'USD',
    type: 'investment',
    status: 'active',
    lastTransaction: '2023-03-05T09:15:00Z',
  },
];

export default function AccountsPage() {
  const { user } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ProtectedRoute>
      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
              Accounts
            </h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Account List */}
                <div className="lg:col-span-1">
                  <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                          Your Accounts
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                          Select an account to view details
                        </p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600"
                      >
                        Add Account
                      </button>
                    </div>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {mockAccounts.map((account) => (
                        <li key={account.id}>
                          <button
                            onClick={() => setSelectedAccount(account.id)}
                            className={`w-full text-left px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                              selectedAccount === account.id ? 'bg-gray-50 dark:bg-gray-700' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {account.accountName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {account.accountNumber}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {formatCurrency(account.balance, account.currency)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                  {account.type}
                                </p>
                              </div>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Account Details */}
                <div className="lg:col-span-2">
                  {selectedAccount ? (
                    (() => {
                      const account = mockAccounts.find(a => a.id === selectedAccount);
                      if (!account) return null;
                      
                      return (
                        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                          <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                              {account.accountName}
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                              Account details and transaction history
                            </p>
                          </div>
                          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
                            <dl className="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
                              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Number</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0">
                                  {account.accountNumber}
                                </dd>
                              </div>
                              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Balance</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0 font-semibold">
                                  {formatCurrency(account.balance, account.currency)}
                                </dd>
                              </div>
                              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Type</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0 capitalize">
                                  {account.type}
                                </dd>
                              </div>
                              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                                <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    account.status === 'active' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  }`}>
                                    {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                                  </span>
                                </dd>
                              </div>
                              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Transaction</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0">
                                  {formatDate(account.lastTransaction)}
                                </dd>
                              </div>
                            </dl>
                          </div>
                          
                          {/* Quick Actions */}
                          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Quick Actions</h4>
                            <div className="flex flex-wrap gap-3">
                              <button
                                type="button"
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600"
                              >
                                Transfer Funds
                              </button>
                              <button
                                type="button"
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                              >
                                View Statements
                              </button>
                              <button
                                type="button"
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                              >
                                Account Settings
                              </button>
                            </div>
                          </div>
                          
                          {/* Recent Transactions */}
                          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Recent Transactions</h4>
                              <button
                                type="button"
                                className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                              >
                                View all
                              </button>
                            </div>
                            <div className="overflow-hidden">
                              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                  <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Date
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Description
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                      Amount
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                  {/* Mock transactions */}
                                  <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                      Mar 15, 2023
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                      Direct Deposit - Payroll
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 dark:text-green-400 font-medium">
                                      +$2,500.00
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                      Mar 14, 2023
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                      Online Purchase - Amazon
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 dark:text-red-400 font-medium">
                                      -$85.42
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                      Mar 12, 2023
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                      ATM Withdrawal
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 dark:text-red-400 font-medium">
                                      -$200.00
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                      Mar 10, 2023
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                      Transfer from Savings
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 dark:text-green-400 font-medium">
                                      +$500.00
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg p-6 flex flex-col items-center justify-center h-full">
                      <svg className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Select an account</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Choose an account from the list to view its details and transactions
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
