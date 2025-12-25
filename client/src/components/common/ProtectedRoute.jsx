import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute - Restricts access based on authentication and optional role requirements
 * @param {React.Component} element - Component to render if authorized
 * @param {string[]} requiredRoles - Array of roles allowed to access (optional)
 * @example
 * <ProtectedRoute element={<SellerDashboard />} requiredRoles={['seller']} />
 */
export default function ProtectedRoute({ element, requiredRoles = null }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-slate-400 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required, check if user has the required role
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-black text-white mb-4">Access Denied</h1>
          <p className="text-slate-400 mb-8">You don't have permission to access this page.</p>
          <p className="text-sm text-slate-500">Required role: {requiredRoles.join(' or ')}</p>
          <p className="text-sm text-slate-500">Your role: {user.role}</p>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized
  return element;
}
