import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { can, PermissionAction } from '@/lib/permissions';
import { toast } from '@/components/ui/toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: PermissionAction;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPermission }) => {
  const { currentUser, token } = useAuthStore();
  const location = useLocation();

  // 1. Unauthenticated Guard: Redirect to /login
  if (!token || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role-Based Access Control (RBAC) Guard
  if (requiredPermission && !can(currentUser.role, requiredPermission)) {
    // Notify user of permission violation
    setTimeout(() => {
      toast.error(
        `Access Denied: Your account role ('${currentUser.role}') is not authorized to access this page.`,
        'Permission Denied'
      );
    }, 100);

    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
};

/**
 * Public Only Route Guard (e.g. for /login)
 * If already logged in, redirects directly to /app/dashboard
 */
export const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, token } = useAuthStore();

  if (token && currentUser) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
};
