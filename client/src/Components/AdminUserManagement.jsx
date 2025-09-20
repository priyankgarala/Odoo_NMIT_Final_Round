import { useState, useEffect } from "react";
import { getAllRoles, adminCreateUser, getAllUsers } from "../api/userManagement.js";
import { Loader2, Plus, Users, Shield, UserCheck } from "lucide-react";
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
  
    // Form validation (basic example)
    if (!contactFormData.contactName || !contactFormData.email) {
      setError("Contact Name and Email are required");
      return;
    }
  
    try {
      // Example API call:
      // await createContactMaster(contactFormData);
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
    // Clear previous errors
    setError("");

    // Check required fields
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

    // Validate login ID length
    if (formData.loginId.length < 6 || formData.loginId.length > 12) {
      setError("Login ID must be between 6-12 characters");
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    // Validate password strength
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
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  if (initialLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading user management data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage users and their roles in the system</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create User
          </button>
          <button
            onClick={() => setShowContactForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Contact
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

    {showContactForm && (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Create Contact</h3>
            <button onClick={() => setShowContactForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-3">
            <input
              type="text"
              name="contactName"
              placeholder="Contact Name"
              value={contactFormData.contactName}
              onChange={handleContactChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={contactFormData.email}
              onChange={handleContactChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={contactFormData.phone}
              onChange={handleContactChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={contactFormData.address}
              onChange={handleContactChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={contactFormData.city}
              onChange={handleContactChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={contactFormData.state}
              onChange={handleContactChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              name="postcode"
              placeholder="Postcode"
              value={contactFormData.postcode}
              onChange={handleContactChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="file"
              name="image"
              onChange={handleContactChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />

            <div className="flex justify-end gap-2 pt-3">
              <button type="button" onClick={() => setShowContactForm(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
            </div>
          </form>
        </div>
      </div>
    )}

      {/* Users List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">All Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Login ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.login_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role_name)}
                      <span className="text-sm text-gray-900 capitalize">
                        {user.role_name?.replace('_', ' ') || 'No Role'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Create New User</h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setError("");
                    setSuccess("");
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Login ID * (6-12 characters)
                    </label>
                    <input
                      type="text"
                      name="loginId"
                      value={formData.loginId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter login ID"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter email address"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <select
                      name="roleId"
                      value={formData.roleId}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                {/* Password Section */}
                <div className="border-t pt-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Password Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter password"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Must contain uppercase, lowercase, special character, and be 8+ characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Confirm password"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="border-t pt-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information (Optional)</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="contactData.phone"
                        value={formData.contactData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        name="contactData.company"
                        value={formData.contactData.company}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter company name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Type
                      </label>
                      <select
                        name="contactData.contactType"
                        value={formData.contactData.contactType}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="customer">Customer</option>
                        <option value="vendor">Vendor</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <textarea
                        name="contactData.address"
                        value={formData.contactData.address}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter address"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setError("");
                      setSuccess("");
                    }}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    {loading ? "Creating User..." : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
