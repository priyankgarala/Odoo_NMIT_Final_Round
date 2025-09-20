// hooks/useLogin.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth.js";
import { loginSchema } from "../utils/validator.js";

export function useLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      setErrors(result.error.errors[0].message);
      setLoading(false);
      return;
    }

    try {
      await loginUser(formData.email, formData.password);
      navigate("/");
      setSuccess(true);
      setErrors("");
      setFormData({ email: "", password: "" });
    } catch (err) {
      const backendMessage = err?.response?.data?.message;
      const networkMessage = err?.message;
      setErrors(backendMessage || networkMessage || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { formData, errors, loading, success, handleChange, handleSubmit };
}
