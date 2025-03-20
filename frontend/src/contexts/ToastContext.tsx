'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ToastContainer from '@/components/notifications/ToastContainer';
import { ToastProps } from '@/components/notifications/Toast';

type ToastType = 'success' | 'error' | 'warning' | 'info';
type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

interface ToastOptions {
  duration?: number;
  position?: ToastPosition;
}

interface ToastContextType {
  showToast: (title: string, message: string, type: ToastType, options?: ToastOptions) => string;
  dismissToast: (id: string) => void;
  dismissAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
  defaultPosition?: ToastPosition;
  defaultDuration?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  defaultPosition = 'top-right',
  defaultDuration = 5000, // Default 5 seconds
}) => {
  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);
  const [position, setPosition] = useState<ToastPosition>(defaultPosition);

  const showToast = useCallback(
    (title: string, message: string, type: ToastType, options?: ToastOptions): string => {
      const id = uuidv4();
      const newToast: Omit<ToastProps, 'onClose'> = {
        id,
        title,
        message,
        type,
        duration: options?.duration ?? defaultDuration,
      };

      if (options?.position && options.position !== position) {
        setPosition(options.position);
      }

      setToasts((prevToasts) => [...prevToasts, newToast]);
      return id;
    },
    [defaultDuration, position]
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const dismissAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        dismissToast,
        dismissAllToasts,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onClose={dismissToast} position={position} />
    </ToastContext.Provider>
  );
};

export default ToastContext;
