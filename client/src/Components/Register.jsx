import { Link } from "react-router-dom";
import InputField from "./InputField.jsx";
import { Loader2 } from "lucide-react";
import { useRegister } from "../hooks/useRegister.js";

export default function Register() {
  const { formData, errors, loading, handleChange, handleSubmit } = useRegister();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-2xl">
        <div className="flex flex-col items-start justify-center">
          <h2 className="text-2xl font-bold text-start mb-2">Create your account</h2>
          <p className="text-sm text-start mb-6">Enter your details below to create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <InputField
            label="Login ID (6-12 characters)"
            type="text"
            name="loginId"
            value={formData.loginId}
            onChange={handleChange}
            required
          />
          <InputField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <InputField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <InputField
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          
          <button
            type="submit"
            className="w-full bg-black py-2 text-white rounded-lg hover:bg-primary/90 transition"
            disabled={loading}
          >
            {loading && <Loader2 className="w-full h-4 animate-spin" />}
            {!loading && "Sign Up"}
          </button>
          {errors && (
            <p className="text-red-600 text-sm text-center">{errors}</p>
          )}
        </form>
        
        <p className="mt-5 text-sm text-center">
          Already have an account?{" "}
          <Link className="text-blue-600 hover:underline" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
