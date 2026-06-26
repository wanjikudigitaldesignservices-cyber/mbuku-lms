// ============================================================
// mbuku LMS — Role Guard
// Restricts access based on user role
// ============================================================

import { Navigate } from 'react-router';
import { useAuthContext } from '@/contexts/AuthContext';
import type { UserRole } from '@/lib/types/database';
import { Loader2, ShieldX } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { profile, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(profile.role)) {
    // Redirect students to learn portal, others to their appropriate portal
    if (profile.role === 'student') {
      return <Navigate to="/learn" replace />;
    }
    if (profile.role === 'instructor') {
      return <Navigate to="/instructor" replace />;
    }

    // Fallback: show unauthorized
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <ShieldX className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground max-w-md">
            You don't have permission to access this area.
            Contact an administrator if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
