import React from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const PrivateRoute = ({ children }) => {
  const token = Cookies.get("accessToken"); // get token from cookie

  // console.log("All cookies:", document.cookie);
  // console.log("Access token:", token);
  // console.log("Token type:", typeof token);
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
