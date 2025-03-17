'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  
  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  
  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    marketing_emails: false,
    security_alerts: true,
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would call an API to update the password
    console.log('Password update:', passwordForm);
    
    // Reset form after submission
    setPasswordForm({
      current_password: '',
      new_password: '',
      confirm_password: '',
    });
  };

  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would call an API to update notification settings
    console.log('Notification settings update:', notificationSettings);
  };

  const tabs = [
    { id: 'account', name: 'Account' },
    { id: 'security', name: 'Security' },
    { id: 'notifications', name: 'Notifications' },
  ];

  return (
    <ProtectedRoute>
      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">
              Settings
            </h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="flex flex-col md:flex-row">
                {/* Tabs */}
                <div className="w-full md:w-64 mb-8 md:mb-0">
                  <nav className="space-y-1" aria-label="Settings">
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
                    {/* Account Settings */}
                    {activeTab === 'account' && (
                      <div>
                        <div className="px-4 py-5 sm:px-6">
                          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                            Account Settings
                          </h3>
                          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                            Manage your account preferences.
                          </p>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Language</h4>
                              <select
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                defaultValue="en"
                              >
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                              </select>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Time Zone</h4>
                              <select
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                defaultValue="America/New_York"
                              >
                                <option value="America/New_York">Eastern Time (US & Canada)</option>
                                <option value="America/Chicago">Central Time (US & Canada)</option>
                                <option value="America/Denver">Mountain Time (US & Canada)</option>
                                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                                <option value="Europe/London">London</option>
                                <option value="Asia/Tokyo">Tokyo</option>
                              </select>
                            </div>
                            <div className="flex justify-end">
                              <button
                                type="button"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Security Settings */}
                    {activeTab === 'security' && (
                      <div>
                        <div className="px-4 py-5 sm:px-6">
                          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                            Security Settings
                          </h3>
                          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                            Manage your password and security preferences.
                          </p>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
                          <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Change Password</h4>
                              <div className="space-y-4">
                                <div>
                                  <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Current Password
                                  </label>
                                  <input
                                    type="password"
                                    name="current_password"
                                    id="current_password"
                                    value={passwordForm.current_password}
                                    onChange={handlePasswordChange}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                  />
                                </div>
                                <div>
                                  <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    New Password
                                  </label>
                                  <input
                                    type="password"
                                    name="new_password"
                                    id="new_password"
                                    value={passwordForm.new_password}
                                    onChange={handlePasswordChange}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                  />
                                </div>
                                <div>
                                  <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Confirm New Password
                                  </label>
                                  <input
                                    type="password"
                                    name="confirm_password"
                                    id="confirm_password"
                                    value={passwordForm.confirm_password}
                                    onChange={handlePasswordChange}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <button
                                type="submit"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600"
                              >
                                Update Password
                              </button>
                            </div>
                          </form>

                          <div className="mt-10 pt-10 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Two-Factor Authentication</h4>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Add an extra layer of security to your account
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  Status: <span className="text-red-600 dark:text-red-400 font-medium">Not Enabled</span>
                                </p>
                              </div>
                              <button
                                type="button"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                              >
                                Enable 2FA
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notification Settings */}
                    {activeTab === 'notifications' && (
                      <div>
                        <div className="px-4 py-5 sm:px-6">
                          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                            Notification Settings
                          </h3>
                          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                            Manage how you receive notifications.
                          </p>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
                          <form onSubmit={handleNotificationSubmit} className="space-y-6">
                            <fieldset>
                              <legend className="text-sm font-medium text-gray-900 dark:text-white">
                                Email Notifications
                              </legend>
                              <div className="mt-4 space-y-4">
                                <div className="flex items-start">
                                  <div className="flex items-center h-5">
                                    <input
                                      id="email_notifications"
                                      name="email_notifications"
                                      type="checkbox"
                                      checked={notificationSettings.email_notifications}
                                      onChange={handleNotificationChange}
                                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                    />
                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label htmlFor="email_notifications" className="font-medium text-gray-700 dark:text-gray-300">
                                      Transaction notifications
                                    </label>
                                    <p className="text-gray-500 dark:text-gray-400">
                                      Receive emails about your account activity.
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start">
                                  <div className="flex items-center h-5">
                                    <input
                                      id="security_alerts"
                                      name="security_alerts"
                                      type="checkbox"
                                      checked={notificationSettings.security_alerts}
                                      onChange={handleNotificationChange}
                                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                    />
                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label htmlFor="security_alerts" className="font-medium text-gray-700 dark:text-gray-300">
                                      Security alerts
                                    </label>
                                    <p className="text-gray-500 dark:text-gray-400">
                                      Receive emails about security updates and unusual activity.
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start">
                                  <div className="flex items-center h-5">
                                    <input
                                      id="marketing_emails"
                                      name="marketing_emails"
                                      type="checkbox"
                                      checked={notificationSettings.marketing_emails}
                                      onChange={handleNotificationChange}
                                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                    />
                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label htmlFor="marketing_emails" className="font-medium text-gray-700 dark:text-gray-300">
                                      Marketing emails
                                    </label>
                                    <p className="text-gray-500 dark:text-gray-400">
                                      Receive emails about new features and special offers.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </fieldset>
                            <fieldset>
                              <legend className="text-sm font-medium text-gray-900 dark:text-white">
                                SMS Notifications
                              </legend>
                              <div className="mt-4 space-y-4">
                                <div className="flex items-start">
                                  <div className="flex items-center h-5">
                                    <input
                                      id="sms_notifications"
                                      name="sms_notifications"
                                      type="checkbox"
                                      checked={notificationSettings.sms_notifications}
                                      onChange={handleNotificationChange}
                                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                                    />
                                  </div>
                                  <div className="ml-3 text-sm">
                                    <label htmlFor="sms_notifications" className="font-medium text-gray-700 dark:text-gray-300">
                                      Transaction alerts
                                    </label>
                                    <p className="text-gray-500 dark:text-gray-400">
                                      Receive text messages for important account activity.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </fieldset>
                            <div className="flex justify-end">
                              <button
                                type="submit"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600"
                              >
                                Save Preferences
                              </button>
                            </div>
                          </form>
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
    </ProtectedRoute>
  );
}
