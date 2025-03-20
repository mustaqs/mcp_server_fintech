'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TrustedDevice } from '@/types/user';
import { FiMonitor, FiSmartphone, FiTablet, FiTrash2, FiInfo, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const TrustedDevicesManager: React.FC = () => {
  const { getTrustedDevices, removeTrustedDevice } = useAuth();
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deviceToRemove, setDeviceToRemove] = useState<string | null>(null);

  useEffect(() => {
    loadTrustedDevices();
  }, []);

  const loadTrustedDevices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const trustedDevices = await getTrustedDevices();
      setDevices(trustedDevices);
    } catch (err: any) {
      setError(err.message || 'Failed to load trusted devices');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      await removeTrustedDevice(deviceId);
      
      // Remove device from local state
      setDevices(devices.filter(device => device.id !== deviceId));
      setSuccess('Device removed successfully');
      setDeviceToRemove(null);
    } catch (err: any) {
      setError(err.message || 'Failed to remove device');
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    const type = deviceType.toLowerCase();
    if (type.includes('mobile') || type.includes('phone') || type.includes('android') || type.includes('ios')) {
      return <FiSmartphone className="h-5 w-5 text-blue-500" />;
    } else if (type.includes('tablet') || type.includes('ipad')) {
      return <FiTablet className="h-5 w-5 text-green-500" />;
    } else {
      return <FiMonitor className="h-5 w-5 text-purple-500" />;
    }
  };

  const formatLastUsed = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatDeviceInfo = (device: TrustedDevice) => {
    return `${device.browser} on ${device.operating_system}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Trusted Devices</h3>
        <button
          onClick={loadTrustedDevices}
          className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          disabled={isLoading}
        >
          Refresh
        </button>
      </div>
      
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiCheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">{success}</h3>
            </div>
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500 dark:text-gray-400">
        These are the devices you've marked as trusted. You won't need to verify your identity when logging in from these devices.
      </p>

      {isLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading trusted devices...</p>
        </div>
      ) : devices.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <FiInfo className="h-8 w-8 text-gray-400 mx-auto" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">You don't have any trusted devices yet.</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            When logging in, select "Trust this device" to add it to your trusted devices.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Device
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Used
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {devices.map((device) => (
                <tr key={device.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getDeviceIcon(device.device_type)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {device.device_name || formatDeviceInfo(device)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {device.browser}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {device.last_used ? formatLastUsed(device.last_used) : 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {device.ip_address ? (
                      <div>
                        <div>{'Unknown location'}</div>
                        <div className="text-xs">{device.ip_address}</div>
                      </div>
                    ) : (
                      'Unknown'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {deviceToRemove === device.id ? (
                      <div className="flex items-center space-x-2 justify-end">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Confirm?</span>
                        <button
                          onClick={() => handleRemoveDevice(device.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeviceToRemove(null)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeviceToRemove(device.id)}
                        className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 flex items-center"
                      >
                        <FiTrash2 className="h-4 w-4 mr-1" />
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TrustedDevicesManager;
