import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

/**
 * Wraps any route that requires authentication.
 * - While session is loading → shows a full-screen spinner
 * - If no session → redirects to /signin (preserves the attempted URL)
 * - If session exists → renders children normally
 */
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050B17]">
        <div className="flex flex-col items-center gap-4 text-zinc-400 font-mono text-sm">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
          <span>Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    // Redirect to /signin and remember where the user was trying to go
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
