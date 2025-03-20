'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import TrustedDevicesManager from '@/components/auth/TrustedDevicesManager';
import { changePassword, updateNotificationPreferences } from '@/services/userService';
import { FiUser, FiLock, FiBell, FiShield, FiCheck, FiX, FiAlertTriangle, FiSmartphone, FiMail, FiKey, FiMonitor } from 'react-icons/fi';

export default function SettingsPage() {
  const { 
    user, 
    setupMFA, 
    verifyMFASetup, 
    disableMFA, 
    generateRecoveryCodes,
    setupTOTP,
    verifyTOTPSetup,
    setupSMS,
    verifySMSSetup,
    getMFAPreferences,
    updatePreferredMFAMethod,
    getLoginAttempts
  } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('account');
  const [loginAttempts, setLoginAttempts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // MFA states
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [mfaSetupData, setMfaSetupData] = useState<any>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedMFAMethod, setSelectedMFAMethod] = useState<string>('email');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mfaPreferences, setMfaPreferences] = useState<any>(null);
  const [showMethodSelection, setShowMethodSelection] = useState(false);
  const [totpSecretKey, setTotpSecretKey] = useState('');
  const [totpQrCodeUrl, setTotpQrCodeUrl] = useState('');
  
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
  
  // Load user notification preferences when component mounts
  useEffect(() => {
    if (user && user.notification_preferences) {
      setNotificationSettings(user.notification_preferences);
    }
    
    // Load login attempts if security tab is active
    if (activeTab === 'security') {
      loadLoginAttempts();
    }
  }, [user, activeTab]);

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

  // Load MFA preferences when component mounts
  useEffect(() => {
    if (user?.mfa_enabled) {
      loadMFAPreferences();
    }
  }, [user]);

  const loadMFAPreferences = async () => {
    try {
      setIsLoading(true);
      const preferences = await getMFAPreferences();
      setMfaPreferences(preferences);
    } catch (err: any) {
      setError(err.message || 'Failed to load MFA preferences');
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadLoginAttempts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const attempts = await getLoginAttempts();
      setLoginAttempts(attempts);
    } catch (err: any) {
      setError(err.message || 'Failed to load login attempts');
      console.error('Error loading login attempts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // MFA handler functions
  const handleEnableMFA = () => {
    setShowMethodSelection(true);
  };

  const handleMethodSelect = (method: string) => {
    setSelectedMFAMethod(method);
    setShowMethodSelection(false);
    setShowMFASetup(true);
  };

  const handleStartMFASetup = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (selectedMFAMethod === 'email') {
        const response = await setupMFA('email');
        setMfaSetupData(response);
      } else if (selectedMFAMethod === 'totp') {
        const response = await setupTOTP();
        setTotpSecretKey(response.secret_key);
        setTotpQrCodeUrl(response.qr_code_url);
        setMfaSetupData(response);
      } else if (selectedMFAMethod === 'sms') {
        if (!phoneNumber) {
          setError('Please enter your phone number');
          setIsLoading(false);
          return;
        }
        const response = await setupSMS(phoneNumber);
        setMfaSetupData(response);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to setup MFA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyMFASetup = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      if (selectedMFAMethod === 'email') {
        await verifyMFASetup(verificationCode);
      } else if (selectedMFAMethod === 'totp') {
        await verifyTOTPSetup(verificationCode, mfaSetupData.setup_token);
      } else if (selectedMFAMethod === 'sms') {
        await verifySMSSetup(verificationCode, mfaSetupData.setup_token);
      }
      
      setSuccess(`Two-factor authentication (${selectedMFAMethod}) has been enabled`);
      setShowMFASetup(false);
      setMfaSetupData(null);
      setVerificationCode('');
      setTotpSecretKey('');
      setTotpQrCodeUrl('');
      setPhoneNumber('');
      loadMFAPreferences();
    } catch (err: any) {
      setError(err.message || 'Failed to verify MFA setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableMFA = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await disableMFA(confirmPassword);
      setSuccess('Two-factor authentication has been disabled');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to disable MFA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRecoveryCodes = async () => {
    if (!confirmPassword) {
      setError('Please enter your password');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await generateRecoveryCodes(confirmPassword);
      setRecoveryCodes(response.recovery_codes);
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to generate recovery codes');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('New passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await changePassword(
        passwordForm.current_password,
        passwordForm.new_password
      );
      
      setSuccess('Password changed successfully');
      
      // Reset form after submission
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await updateNotificationPreferences(notificationSettings);
      setSuccess('Notification preferences updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update notification preferences');
    } finally {
      setIsLoading(false);
    }
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
                  {/* Success and error messages */}
                  {success && (
                    <div className="mb-4 p-2 bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded-md">
                      {success}
                    </div>
                  )}
                  {error && (
                    <div className="mb-4 p-2 bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm rounded-md">
                      {error}
                    </div>
                  )}
                  
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
                                disabled={isLoading}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50"
                              >
                                {isLoading ? 'Saving...' : 'Save Changes'}
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
                            
                            {showMethodSelection ? (
                              <div className="space-y-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Choose your preferred method for two-factor authentication:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div 
                                    onClick={() => handleMethodSelect('email')}
                                    className="p-4 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-700 transition-colors"
                                  >
                                    <div className="flex items-center mb-2">
                                      <FiMail className="h-5 w-5 text-blue-500 mr-2" />
                                      <h4 className="font-medium">Email</h4>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      Receive verification codes via email
                                    </p>
                                  </div>
                                  
                                  <div 
                                    onClick={() => handleMethodSelect('sms')}
                                    className="p-4 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-700 transition-colors"
                                  >
                                    <div className="flex items-center mb-2">
                                      <FiSmartphone className="h-5 w-5 text-green-500 mr-2" />
                                      <h4 className="font-medium">SMS</h4>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      Receive verification codes via text message
                                    </p>
                                  </div>
                                  
                                  <div 
                                    onClick={() => handleMethodSelect('totp')}
                                    className="p-4 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-700 transition-colors"
                                  >
                                    <div className="flex items-center mb-2">
                                      <FiKey className="h-5 w-5 text-purple-500 mr-2" />
                                      <h4 className="font-medium">Authenticator App</h4>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      Use an authenticator app like Google Authenticator or Authy
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex justify-end space-x-2 mt-4">
                                  <button
                                    type="button"
                                    onClick={() => setShowMethodSelection(false)}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : !showMFASetup && !showRecoveryCodes ? (
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Add an extra layer of security to your account
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Status: 
                                    {user?.mfa_enabled ? (
                                      <span className="text-green-600 dark:text-green-400 font-medium">Enabled</span>
                                    ) : (
                                      <span className="text-red-600 dark:text-red-400 font-medium">Not Enabled</span>
                                    )}
                                  </p>
                                  {mfaPreferences && mfaPreferences.methods && mfaPreferences.methods.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Enabled methods:
                                      </p>
                                      <div className="flex flex-wrap gap-2 mt-1">
                                        {mfaPreferences.methods.map((method: any) => (
                                          method.enabled && (
                                            <span 
                                              key={method.method} 
                                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${method.is_primary ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
                                            >
                                              {method.method === 'email' && <FiMail className="mr-1" />}
                                              {method.method === 'sms' && <FiSmartphone className="mr-1" />}
                                              {method.method === 'totp' && <FiKey className="mr-1" />}
                                              {method.method.charAt(0).toUpperCase() + method.method.slice(1)}
                                              {method.is_primary && ' (Primary)'}
                                            </span>
                                          )
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {user?.mfa_enabled ? (
                                  <div className="space-x-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setConfirmPassword('');
                                        setShowRecoveryCodes(true);
                                      }}
                                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                                    >
                                      View Recovery Codes
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleDisableMFA}
                                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-600"
                                    >
                                      Disable 2FA
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={handleEnableMFA}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                                  >
                                    Enable 2FA
                                  </button>
                                )}
                              </div>
                            ) : showRecoveryCodes ? (
                              <div className="space-y-4">
                                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-md">
                                  <div className="flex">
                                    <div className="flex-shrink-0">
                                      <FiAlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                        Recovery Codes
                                      </h3>
                                      <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                                        <p>
                                          These recovery codes can be used to access your account if you lose access to your authentication device. Each code can only be used once. Store these somewhere safe!
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {recoveryCodes.length > 0 ? (
                                  <div>
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                      {recoveryCodes.map((code, index) => (
                                        <div key={index} className="p-2 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700 font-mono text-sm">
                                          {code}
                                        </div>
                                      ))}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setShowRecoveryCodes(false);
                                        setRecoveryCodes([]);
                                      }}
                                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600"
                                    >
                                      Done
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      Please enter your password to view recovery codes
                                    </p>
                                    <div>
                                      <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Password
                                      </label>
                                      <input
                                        type="password"
                                        name="confirm_password"
                                        id="confirm_password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                      />
                                    </div>
                                    <div className="flex space-x-2">
                                      <button
                                        type="button"
                                        onClick={handleGenerateRecoveryCodes}
                                        disabled={isLoading}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50"
                                      >
                                        {isLoading ? 'Loading...' : 'View Codes'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setShowRecoveryCodes(false);
                                          setConfirmPassword('');
                                        }}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-6">
                                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md">
                                  <div className="flex">
                                    <div className="flex-shrink-0">
                                      <FiShield className="h-5 w-5 text-blue-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                        Set up Two-Factor Authentication
                                      </h3>
                                      <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                                        <p>
                                          Two-factor authentication adds an extra layer of security to your account. In addition to your password, you'll need to enter a verification code sent to your email when signing in.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {mfaSetupData ? (
                                  <div className="space-y-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      A verification code has been sent to your email address ({mfaSetupData.email}). Enter the code below to complete setup.
                                    </p>
                                    <div>
                                      <label htmlFor="verification_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Verification Code
                                      </label>
                                      <input
                                        type="text"
                                        name="verification_code"
                                        id="verification_code"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Enter 6-digit code"
                                        required
                                      />
                                    </div>
                                    <div className="flex space-x-2">
                                      <button
                                        type="button"
                                        onClick={handleVerifyMFASetup}
                                        disabled={isLoading || verificationCode.length !== 6}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50"
                                      >
                                        {isLoading ? 'Verifying...' : 'Verify & Enable'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setShowMFASetup(false);
                                          setMfaSetupData(null);
                                          setVerificationCode('');
                                        }}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex space-x-2">
                                    <button
                                      type="button"
                                      onClick={handleStartMFASetup}
                                      disabled={isLoading}
                                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50"
                                    >
                                      {isLoading ? 'Setting up...' : 'Start Setup'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setShowMFASetup(false)}
                                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
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
                                disabled={isLoading}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50"
                              >
                                {isLoading ? 'Saving...' : 'Save Preferences'}
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
