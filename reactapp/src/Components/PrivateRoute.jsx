import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, allowedRoles }) => {
  console.log("Inside private routes");
  const location = useLocation();
  const { userRole } = useSelector((state) => state.user);
  const [isValidating, setIsValidating] = useState(true);

  // Helper to get cookie
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return null;
  };

  // Helper to get token (from sessionStorage)
  const getToken = () => {
    try {
      return sessionStorage.getItem('token');
    } catch (e) {
      console.error('Error reading token:', e);
      return null;
    }
  };

  useEffect(() => {
    setIsValidating(false);
  }, []);

  if (isValidating) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  // Check if user has token
  const token = getToken();
  console.log('🔍 PrivateRoute - Token exists:', !!token);
  
  if (!token) {
    console.log('❌ No token found, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Get current user role - prioritize cookie over Redux state
  const currentRole = getCookie('userRole') || userRole;
  
  console.log('🔍 PrivateRoute - Current Role:', currentRole, 'Allowed Roles:', allowedRoles);

  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    console.log('❌ Role not allowed, redirecting...');
    // Redirect to appropriate dashboard based on role
    if (currentRole === 'Owner') {
      return <Navigate to="/owner/view-livestock" replace />;
    } else if (currentRole === 'Supplier') {
      return <Navigate to="/supplier/view-feeds" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  console.log('✅ Access granted!');
  return children;
};

export default PrivateRoute;