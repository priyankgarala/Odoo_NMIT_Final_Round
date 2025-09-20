// hooks/useRegister.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth.js";
import { validateName, validatePassword } from "../utils/validator.js";

export function useRegister() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({ name: "", password: "", server: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {
      name: validateName(formData.name),
      password: validatePassword(formData.password)
    };

    if (newErrors.name || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    setErrors({ name: "", password: "", server: "" });
    setLoading(true);

    try {
      await registerUser(formData.name, formData.email, formData.password);
      navigate("/verify-otp");
    } catch (err) {
      const backendMessage = err?.response?.data?.message;
      const networkMessage = err?.message;
      setErrors(prev => ({
        ...prev,
        server: backendMessage || networkMessage || "Registration failed. Please try again."
      }));
    } finally {
      setLoading(false);
    }
  };

  return { formData, errors, loading, handleChange, handleSubmit };
}
