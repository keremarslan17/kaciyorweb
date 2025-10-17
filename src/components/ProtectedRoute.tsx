
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!userProfile) {
    console.error("Auth Error: User exists in Auth, but not in Firestore.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // RE-IMPLEMENTED: Phone verification bypass for privileged roles
  const isPrivilegedRole = ['admin', 'businessOwner', 'waiter'].includes(userProfile.role);
  if (!userProfile.phoneVerified && !isPrivilegedRole) {
      return <Navigate to="/phone-verification" state={{ from: location }} replace />;
  }
    
  // RE-IMPLEMENTED: Role-based access control
  if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
      return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
