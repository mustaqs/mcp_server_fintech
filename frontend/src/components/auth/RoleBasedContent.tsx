import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface RoleBasedContentProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}

/**
 * A component that conditionally renders content based on user roles.
 * 
 * @param children - The content to render if the user has the required roles
 * @param allowedRoles - The roles that are allowed to see the content
 * @param fallback - Optional content to render if the user doesn't have the required roles
 */
const RoleBasedContent: React.FC<RoleBasedContentProps> = ({
  children,
  allowedRoles,
  fallback = null,
}) => {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, don't render anything
  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  // Check if user has any of the allowed roles
  const hasAllowedRole = allowedRoles.some(role => user.roles.includes(role));

  // Render children if user has allowed role, otherwise render fallback
  return <>{hasAllowedRole ? children : fallback}</>;
};

export default RoleBasedContent;
