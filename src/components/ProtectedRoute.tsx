
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 1. If user is not logged in, redirect to login page.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If user is logged in but profile isn't loaded yet (edge case), or doesn't exist.
  if (!userProfile) {
    // This can happen briefly. A loading screen is shown above. If it persists, it's an error.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
    
  // 3. If the route requires a specific role, check if the user has it.
  if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
      // If the user's role is not allowed, redirect to the home page.
      return <Navigate to="/" replace />;
  }

  // If all checks pass, render the component.
  // The problematic phone verification redirect has been REMOVED.
  return children;
};

export default ProtectedRoute;
