import { Link } from "react-router-dom";
import InputField from "./InputField.jsx";
import { Loader2, Lock, User, ArrowRight, Shield } from "lucide-react";
import { useLogin } from "../hooks/useLogin.js";

export default function Login() {
  const { formData, errors, loading, handleChange, handleSubmit } = useLogin();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl mb-6 shadow-lg">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent mb-3">
              Welcome Back
            </h2>
            <p className="text-slate-600 text-lg">Enter your details below to access your account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Login Identifier Field */}
            <InputField
              label="Login ID or Email"
              type="text"
              name="loginIdentifier"
              value={formData.loginIdentifier}
              onChange={handleChange}
              placeholder="Enter your login ID or email"
              icon={<User className="w-4 h-4" />}
              required
            />

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-slate-700 text-sm font-semibold flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-blue-600" />
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium hover:underline underline-offset-2"
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
              />
            </div>

            {/* Error Message */}
            {errors && (
              <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  <p className="text-sm font-medium">{errors}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 text-white py-4 rounded-xl shadow-lg hover:shadow-xl disabled:shadow-none transition-all duration-300 font-semibold text-lg hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">New to our platform?</span>
              </div>
            </div>
            <div className="mt-6">
              <Link
                to="/register"
                className="inline-flex items-center justify-center w-full px-6 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50/50 transition-all duration-300 hover:-translate-y-0.5"
              >
                Create New Account
              </Link>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm flex items-center justify-center">
            <Shield className="w-4 h-4 mr-2" />
            Your information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}