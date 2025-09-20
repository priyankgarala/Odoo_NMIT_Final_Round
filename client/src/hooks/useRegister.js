import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../api/userManagement.js";

export function useRegister() {
  const [formData, setFormData] = useState({ 
    name: "", 
    loginId: "", 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.loginId || !formData.email || !formData.password || !formData.confirmPassword) {
      setErrors("All fields are required");
      return false;
    }

    if (formData.loginId.length < 6 || formData.loginId.length > 12) {
      setErrors("Login ID must be between 6-12 characters");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors("Passwords do not match");
      return false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setErrors("Password must contain at least one lowercase letter, one uppercase letter, one special character, and be at least 8 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      await signupUser(formData.name, formData.loginId, formData.email, formData.password);
      setSuccess(true);
      setErrors("");
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (err) {
      const backendMessage = err?.response?.data?.message;
      const networkMessage = err?.message;
      setErrors(backendMessage || networkMessage || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { formData, errors, loading, success, handleChange, handleSubmit };
}