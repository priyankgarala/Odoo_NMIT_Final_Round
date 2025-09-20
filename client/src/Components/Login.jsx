import { Link } from "react-router-dom";
import InputField from "./InputField.jsx";
import { Loader2 } from "lucide-react";
import { useLogin } from "../hooks/useLogin.js";


export default function Login() {
  const { formData, errors, loading, handleChange, handleSubmit } = useLogin();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-2xl">
        <div className="flex flex-col items-start justify-center">
          <h2 className="text-2xl font-bold text-start mb-2">Login to your account</h2>
          <p className="text-sm text-start mb-6">Enter your details below to login to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
              <div className="flex items-center justify-between w-full">
                <label htmlFor="password" className="text-sm text-gray-700 font-medium">Password</label>
                <Link
                  to="/forgot-password"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-blue-600"
                >
                  Forgot your Password?
                </Link>
              </div>
              <InputField
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              required
            />
          
          <button
            type="submit"
            className="w-full bg-black py-2 text-white rounded-lg hover:bg-primary/90 transition"
            disabled={loading}
          >
            {loading && <Loader2 className="w-full h-4 animate-spin" />}
            {!loading && "Login"}
          </button>
          {errors && (
            <p className="text-red-600 text-sm text-center">{errors}</p>
          )}
        </form>
        
        <p className="mt-5 text-sm text-center">
          Don’t have an account?{" "}
          <Link className="text-blue-600 hover:underline" to="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
