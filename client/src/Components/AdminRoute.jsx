import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance.js";

export default function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Try to make a request that requires admin access
        const response = await axiosInstance.get("/api/user-management/admin/users");
        setIsAdmin(true);
      } catch (error) {
        if (error.response?.status === 403) {
          setIsAdmin(false);
          navigate("/");
        } else {
          // Handle other errors (network, etc.)
          setIsAdmin(false);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Checking permissions...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
}
