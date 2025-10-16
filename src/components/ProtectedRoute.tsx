import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: string; // Make it optional
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If a requiredRole is specified, check if the user has that role
  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/" replace />; // Redirect if role doesn't match
  }

  return children;
};

export default ProtectedRoute;
