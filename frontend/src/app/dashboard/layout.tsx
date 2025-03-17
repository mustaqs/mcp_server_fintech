'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Dashboard layout content */}
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  );
}
