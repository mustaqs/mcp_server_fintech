import React, { useEffect, useState } from 'react';
import { Transition } from '@headlessui/react';

export interface ToastProps {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number; // in milliseconds
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  title,
  message,
  type,
  duration = 5000, // Default 5 seconds
  onClose,
}) => {
  const [show, setShow] = useState(true);

  // Auto-dismiss after duration
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        setShow(false);
        // Add a small delay before calling onClose to allow the transition to complete
        setTimeout(() => onClose(id), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  // Handle manual close
  const handleClose = () => {
    setShow(false);
    // Add a small delay before calling onClose to allow the transition to complete
    setTimeout(() => onClose(id), 300);
  };

  // Get icon and background color based on type
  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: (
            <svg className="h-6 w-6 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgClass: 'bg-green-50 dark:bg-green-900/30',
          borderClass: 'border-green-200 dark:border-green-800',
          titleClass: 'text-green-800 dark:text-green-200',
          messageClass: 'text-green-700 dark:text-green-300',
        };
      case 'error':
        return {
          icon: (
            <svg className="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgClass: 'bg-red-50 dark:bg-red-900/30',
          borderClass: 'border-red-200 dark:border-red-800',
          titleClass: 'text-red-800 dark:text-red-200',
          messageClass: 'text-red-700 dark:text-red-300',
        };
      case 'warning':
        return {
          icon: (
            <svg className="h-6 w-6 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          bgClass: 'bg-yellow-50 dark:bg-yellow-900/30',
          borderClass: 'border-yellow-200 dark:border-yellow-800',
          titleClass: 'text-yellow-800 dark:text-yellow-200',
          messageClass: 'text-yellow-700 dark:text-yellow-300',
        };
      case 'info':
      default:
        return {
          icon: (
            <svg className="h-6 w-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgClass: 'bg-blue-50 dark:bg-blue-900/30',
          borderClass: 'border-blue-200 dark:border-blue-800',
          titleClass: 'text-blue-800 dark:text-blue-200',
          messageClass: 'text-blue-700 dark:text-blue-300',
        };
    }
  };

  const styles = getToastStyles();

  return (
    <Transition
      show={show}
      enter="transition ease-out duration-300"
      enterFrom="transform opacity-0 scale-95 translate-y-2"
      enterTo="transform opacity-100 scale-100 translate-y-0"
      leave="transition ease-in duration-200"
      leaveFrom="transform opacity-100 scale-100 translate-y-0"
      leaveTo="transform opacity-0 scale-95 translate-y-2"
    >
      <div 
        className={`max-w-sm w-full ${styles.bgClass} shadow-lg rounded-lg pointer-events-auto border ${styles.borderClass}`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {styles.icon}
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className={`text-sm font-medium ${styles.titleClass}`}>{title}</p>
              <p className={`mt-1 text-sm ${styles.messageClass}`}>{message}</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={handleClose}
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
};

export default Toast;
