// src/routes/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    // Not logged in → redirect to auth page
    return <Navigate to="/auth" replace />;
  }

  // Logged in → render the page
  return children;
};

export default PrivateRoute;
