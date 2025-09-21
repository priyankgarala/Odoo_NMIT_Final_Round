import { useState, useEffect } from "react";
import { getAllRoles, adminCreateUser, getAllUsers } from "../api/userManagement.js";
import { Loader2, Plus, Users, Shield, UserCheck, X, Mail, Phone, Building2, MapPin, Calendar, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminUserManagement() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactFormData, setContactFormData] = useState({
    contactName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postcode: "",
    image: null
  });

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    loginId: "",
    email: "",
    password: "",
    confirmPassword: "",
    roleId: "",
    contactData: {
      phone: "",
      company: "",
      address: "",
      contactType: "customer"
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const handleContactChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setContactFormData(prev => ({ ...prev, image: files[0] }));
    } else {
      setContactFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
  
    if (!contactFormData.contactName || !contactFormData.email) {
      setError("Contact Name and Email are required");
      return;
    }
  
    try {
      setSuccess("Contact created successfully");
      setShowContactForm(false);
      setContactFormData({
        contactName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        postcode: "",
        image: null
      });
    } catch (err) {
      setError("Failed to create contact");
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await getAllRoles();
      setRoles(response.roles);
    } catch (err) {
      setError("Failed to fetch roles");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response.users);
    } catch (err) {
      setError("Failed to fetch users");
    }
  };

  const fetchData = async () => {
    setInitialLoading(true);
    try {
      await Promise.all([fetchRoles(), fetchUsers()]);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('contactData.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactData: {
          ...prev.contactData,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    setError("");

    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }

    if (!formData.loginId.trim()) {
      setError("Login ID is required");
      return false;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }

    if (!formData.password) {
      setError("Password is required");
      return false;
    }

    if (!formData.roleId) {
      setError("Role is required");
      return false;
    }

    if (formData.loginId.length < 6 || formData.loginId.length > 12) {
      setError("Login ID must be between 6-12 characters");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError("Password must contain at least one lowercase letter, one uppercase letter, one special character, and be at least 8 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      await adminCreateUser(
        formData.name,
        formData.loginId,
        formData.email,
        formData.password,
        formData.roleId,
        formData.contactData
      );
      
      setSuccess("User created successfully");
      setFormData({
        name: "",
        loginId: "",
        email: "",
        password: "",
        confirmPassword: "",
        roleId: "",
        contactData: {
          phone: "",
          company: "",
          address: "",
          contactType: "customer"
        }
      });
      setShowCreateForm(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (roleName) => {
    switch (roleName) {
      case 'admin':
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'accountant':
        return <UserCheck className="w-4 h-4 text-blue-500" />;
      case 'invoicing_user':
        return <Users className="w-4 h-4 text-green-500" />;
      default:
        return <Users className="w-4 h-4 text-slate-500" />;
    }
  };

  const getRoleBadgeColor = (roleName) => {
    switch (roleName) {
      case 'admin':
        return 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 border-red-200';
      case 'accountant':
        return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-200';
      case 'invoicing_user':
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-700 border-green-200';
      default:
        return 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border-slate-200';
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/50">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Loading User Management</h3>
            <p className="text-slate-600">Please wait while we fetch the data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent mb-3">
                  User Management
                </h1>
                <p className="text-slate-600 text-lg">Manage users and their roles in the system</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-medium hover:-translate-y-0.5"
                >
                  <Plus className="w-5 h-5" />
                  Create User
                </button>
                <button
                  onClick={() => setShowContactForm(true)}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-medium hover:-translate-y-0.5"
                >
                  <Plus className="w-5 h-5" />
                  Create Contact
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-800 px-6 py-4 rounded-2xl shadow-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-green-800 px-6 py-4 rounded-2xl shadow-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              {success}
            </div>
          </div>
        )}

        {/* Contact Form Modal */}
        {showContactForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-md">
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-semibold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">Create Contact</h3>
                    <button 
                      onClick={() => setShowContactForm(false)} 
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>

                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        name="contactName"
                        placeholder="Contact Name"
                        value={contactFormData.contactName}
                        onChange={handleContactChange}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={contactFormData.email}
                        onChange={handleContactChange}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={contactFormData.phone}
                        onChange={handleContactChange}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="address"
                        placeholder="Address"
                        value={contactFormData.address}
                        onChange={handleContactChange}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={contactFormData.city}
                        onChange={handleContactChange}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                      />
                      <input
                        type="text"
                        name="state"
                        placeholder="State"
                        value={contactFormData.state}
                        onChange={handleContactChange}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="postcode"
                        placeholder="Postcode"
                        value={contactFormData.postcode}
                        onChange={handleContactChange}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                      />
                    </div>
                    <div>
                      <input
                        type="file"
                        name="image"
                        onChange={handleContactChange}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                      <button 
                        type="button" 
                        onClick={() => setShowContactForm(false)} 
                        className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all duration-300 font-medium"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                      >
                        Create Contact
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50">
          <div className="px-8 py-6 border-b border-slate-200/50">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-slate-800 flex items-center">
                <Users className="w-6 h-6 mr-3 text-blue-600" />
                All Users ({users.length})
              </h2>
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid gap-6">
              {users.map((user) => (
                <div key={user.id} className="group bg-gradient-to-r from-white to-slate-50 border border-slate-200/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-lg group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                          <span className="text-lg font-bold text-blue-700">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {user.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {user.login_id}
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {user.email}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${getRoleBadgeColor(user.role_name)} font-medium text-sm`}>
                        {getRoleIcon(user.role_name)}
                        <span className="capitalize">
                          {user.role_name?.replace('_', ' ') || 'No Role'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Create User Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">Create New User</h3>
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                        setError("");
                        setSuccess("");
                      }}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6 text-slate-500" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                      <h4 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-blue-600" />
                        Basic Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                            placeholder="Enter full name"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Login ID * (6-12 characters)
                          </label>
                          <input
                            type="text"
                            name="loginId"
                            value={formData.loginId}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                            placeholder="Enter login ID"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                            placeholder="Enter email address"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Role *
                          </label>
                          <select
                            name="roleId"
                            value={formData.roleId}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                            required
                          >
                            <option value="">Select a role</option>
                            {roles.map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.name} - {role.description}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Password Section */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                      <h4 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-purple-600" />
                        Password Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Password *
                          </label>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/80 backdrop-blur-sm transition-all"
                            placeholder="Enter password"
                            required
                          />
                          <p className="text-xs text-slate-500 mt-2">
                            Must contain uppercase, lowercase, special character, and be 8+ characters
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Confirm Password *
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/80 backdrop-blur-sm transition-all"
                            placeholder="Confirm password"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                      <h4 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
                        <Phone className="w-5 h-5 mr-2 text-emerald-600" />
                        Contact Information (Optional)
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="contactData.phone"
                            value={formData.contactData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all"
                            placeholder="Enter phone number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Company
                          </label>
                          <input
                            type="text"
                            name="contactData.company"
                            value={formData.contactData.company}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all"
                            placeholder="Enter company name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Contact Type
                          </label>
                          <select
                            name="contactData.contactType"
                            value={formData.contactData.contactType}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all"
                          >
                            <option value="customer">Customer</option>
                            <option value="vendor">Vendor</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Address
                          </label>
                          <textarea
                            name="contactData.address"
                            value={formData.contactData.address}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all resize-none"
                            placeholder="Enter address"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-4 pt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          setError("");
                          setSuccess("");
                        }}
                        className="px-8 py-3 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border border-transparent rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                      >
                        {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        {loading ? "Creating User..." : "Create User"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}