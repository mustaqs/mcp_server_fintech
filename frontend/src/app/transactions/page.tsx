'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Mock transaction data
const mockTransactions = [
  {
    id: 't1',
    date: '2023-03-15T10:30:00Z',
    description: 'Direct Deposit - Payroll',
    amount: 2500.00,
    type: 'credit',
    category: 'income',
    accountId: '1',
    accountName: 'Primary Checking',
    status: 'completed',
    reference: 'REF123456789',
  },
  {
    id: 't2',
    date: '2023-03-14T15:45:00Z',
    description: 'Online Purchase - Amazon',
    amount: 85.42,
    type: 'debit',
    category: 'shopping',
    accountId: '1',
    accountName: 'Primary Checking',
    status: 'completed',
    reference: 'REF987654321',
  },
  {
    id: 't3',
    date: '2023-03-12T12:15:00Z',
    description: 'ATM Withdrawal',
    amount: 200.00,
    type: 'debit',
    category: 'cash',
    accountId: '1',
    accountName: 'Primary Checking',
    status: 'completed',
    reference: 'REF456789123',
  },
  {
    id: 't4',
    date: '2023-03-10T14:45:00Z',
    description: 'Transfer from Savings',
    amount: 500.00,
    type: 'credit',
    category: 'transfer',
    accountId: '1',
    accountName: 'Primary Checking',
    status: 'completed',
    reference: 'REF789123456',
  },
  {
    id: 't5',
    date: '2023-03-08T09:30:00Z',
    description: 'Grocery Store - Whole Foods',
    amount: 125.37,
    type: 'debit',
    category: 'groceries',
    accountId: '1',
    accountName: 'Primary Checking',
    status: 'completed',
    reference: 'REF321654987',
  },
  {
    id: 't6',
    date: '2023-03-05T20:15:00Z',
    description: 'Restaurant - Cheesecake Factory',
    amount: 78.92,
    type: 'debit',
    category: 'dining',
    accountId: '1',
    accountName: 'Primary Checking',
    status: 'completed',
    reference: 'REF654987321',
  },
  {
    id: 't7',
    date: '2023-03-03T11:00:00Z',
    description: 'Monthly Rent Payment',
    amount: 1500.00,
    type: 'debit',
    category: 'housing',
    accountId: '1',
    accountName: 'Primary Checking',
    status: 'completed',
    reference: 'REF159753456',
  },
  {
    id: 't8',
    date: '2023-03-01T08:45:00Z',
    description: 'Utility Bill - Electricity',
    amount: 95.67,
    type: 'debit',
    category: 'utilities',
    accountId: '1',
    accountName: 'Primary Checking',
    status: 'completed',
    reference: 'REF753159456',
  },
];

// Mock accounts for filtering
const mockAccounts = [
  { id: '1', name: 'Primary Checking' },
  { id: '2', name: 'Savings Account' },
  { id: '3', name: 'Investment Portfolio' },
];

// Transaction categories for filtering
const transactionCategories = [
  'all',
  'income',
  'shopping',
  'dining',
  'groceries',
  'utilities',
  'housing',
  'transfer',
  'cash',
];

export default function TransactionsPage() {
  const { user } = useAuth();
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string, includeTime: boolean = false) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }

    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Filter transactions based on selected filters
  const filteredTransactions = mockTransactions.filter((transaction) => {
    // Filter by account
    if (filterAccount !== 'all' && transaction.accountId !== filterAccount) {
      return false;
    }

    // Filter by category
    if (filterCategory !== 'all' && transaction.category !== filterCategory) {
      return false;
    }

    // Filter by type
    if (filterType !== 'all' && transaction.type !== filterType) {
      return false;
    }

    // Filter by search query
    if (searchQuery && !transaction.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Filter by date range
    if (dateRange.start && new Date(transaction.date) < new Date(dateRange.start)) {
      return false;
    }
    if (dateRange.end && new Date(transaction.date) > new Date(dateRange.end)) {
      return false;
    }

    return true;
  });

  return (
    <ProtectedRoute>
      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
              Transactions
            </h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              {/* Filters */}
              <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                    Filter Transactions
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Search */}
                    <div>
                      <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Search
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="search"
                          id="search"
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="Search transactions"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Account Filter */}
                    <div>
                      <label htmlFor="account" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Account
                      </label>
                      <select
                        id="account"
                        name="account"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={filterAccount}
                        onChange={(e) => setFilterAccount(e.target.value)}
                      >
                        <option value="all">All Accounts</option>
                        {mockAccounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                      >
                        {transactionCategories.map((category) => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Type Filter */}
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Type
                      </label>
                      <select
                        id="type"
                        name="type"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                      >
                        <option value="all">All Types</option>
                        <option value="credit">Credits</option>
                        <option value="debit">Debits</option>
                      </select>
                    </div>

                    {/* Date Range */}
                    <div>
                      <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Start Date
                      </label>
                      <div className="mt-1">
                        <input
                          type="date"
                          name="start-date"
                          id="start-date"
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          value={dateRange.start}
                          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        End Date
                      </label>
                      <div className="mt-1">
                        <input
                          type="date"
                          name="end-date"
                          id="end-date"
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          value={dateRange.end}
                          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Reset Filters */}
                    <div className="flex items-end">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        onClick={() => {
                          setFilterAccount('all');
                          setFilterCategory('all');
                          setFilterType('all');
                          setSearchQuery('');
                          setDateRange({ start: '', end: '' });
                        }}
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Transaction List */}
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                          Transaction History
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                          {filteredTransactions.length} transactions found
                        </p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600"
                      >
                        Export
                      </button>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Date
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Description
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Category
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Amount
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                            {filteredTransactions.length > 0 ? (
                              filteredTransactions.map((transaction) => (
                                <tr 
                                  key={transaction.id} 
                                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                                    selectedTransaction === transaction.id ? 'bg-gray-50 dark:bg-gray-700' : ''
                                  }`}
                                  onClick={() => setSelectedTransaction(transaction.id)}
                                >
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {formatDate(transaction.date)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {transaction.description}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                                    {transaction.category}
                                  </td>
                                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                                    transaction.type === 'credit' 
                                      ? 'text-green-600 dark:text-green-400' 
                                      : 'text-red-600 dark:text-red-400'
                                  }`}>
                                    {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                  No transactions found matching your filters.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="lg:col-span-1">
                  {selectedTransaction ? (
                    (() => {
                      const transaction = mockTransactions.find(t => t.id === selectedTransaction);
                      if (!transaction) return null;
                      
                      return (
                        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                          <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                              Transaction Details
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(transaction.date, true)}
                            </p>
                          </div>
                          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
                            <dl className="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
                              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0">
                                  {transaction.description}
                                </dd>
                              </div>
                              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</dt>
                                <dd className={`mt-1 text-sm sm:col-span-2 sm:mt-0 font-semibold ${
                                  transaction.type === 'credit' 
                                    ? 'text-green-600 dark:text-green-400' 
                                    : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                </dd>
                              </div>
                              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Account</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0">
                                  {transaction.accountName}
                                </dd>
                              </div>
                              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0 capitalize">
                                  {transaction.category}
                                </dd>
                              </div>
                              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                                <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    transaction.status === 'completed' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                      : transaction.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  }`}>
                                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                  </span>
                                </dd>
                              </div>
                              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Reference</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0">
                                  {transaction.reference}
                                </dd>
                              </div>
                            </dl>
                          </div>
                          
                          {/* Actions */}
                          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
                            <div className="flex flex-wrap gap-3">
                              <button
                                type="button"
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600"
                              >
                                Download Receipt
                              </button>
                              <button
                                type="button"
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                              >
                                Report Issue
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg p-6 flex flex-col items-center justify-center h-full">
                      <svg className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Select a transaction</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Choose a transaction from the list to view its details
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
