import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./Components/PrivateRoute";
import ProfilePage from "./pages/ProfilePage";
import Login from "./Components/Login";
import Register from "./Components/Register";
import AdminUserManagement from "./Components/AdminUserManagement";
import TaxManagement from "./Components/TaxManagement";
import ProductManagement from "./Components/ProductManagement";
import TaxCalculationDemo from "./Components/TaxCalculationDemo";
import AdminRoute from "./Components/AdminRoute";
import { useTheme } from "./ThemeContext.jsx";
import VerifyOTP from "./pages/VerifyOTP";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

export default function App() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Router>
      <button
        onClick={toggleTheme}
        className="fixed bottom-4 right-4 z-50 px-4 py-2 rounded-full bg-gray-800 text-white dark:bg-yellow-400 dark:text-black shadow"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      </button>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Protected Routes */}
        <Route path="/profile" element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin/users" element={
          <PrivateRoute>
            <AdminRoute>
              <AdminUserManagement />
            </AdminRoute>
          </PrivateRoute>
        } />
        
        <Route path="/admin/taxes" element={
          <PrivateRoute>
            <AdminRoute>
              <TaxManagement />
            </AdminRoute>
          </PrivateRoute>
        } />
        
        <Route path="/admin/products" element={
          <PrivateRoute>
            <AdminRoute>
              <ProductManagement />
            </AdminRoute>
          </PrivateRoute>
        } />
        
        <Route path="/admin/tax-demo" element={
          <PrivateRoute>
            <AdminRoute>
              <TaxCalculationDemo />
            </AdminRoute>
          </PrivateRoute>
        } />

        

      </Routes>
    </Router>
  );
}
