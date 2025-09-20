import { useState, useEffect } from "react";
import { Plus, AlertCircle, CheckCircle } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import { getAllTaxes, createTax, updateTax, deleteTax, deactivateTax } from "../api/tax";
import TaxForm from "./TaxForm";
import TaxList from "./TaxList";

export default function TaxManagement() {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTax, setEditingTax] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchTaxes();
  }, []);

  const fetchTaxes = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllTaxes(axiosInstance);
      setTaxes(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch taxes");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTax = async (taxData) => {
    setFormLoading(true);
    setError("");
    try {
      const newTax = await createTax(axiosInstance, taxData);
      setTaxes(prev => [newTax, ...prev]);
      setSuccess("Tax created successfully");
      setShowForm(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create tax");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateTax = async (taxData) => {
    setFormLoading(true);
    setError("");
    try {
      const updatedTax = await updateTax(axiosInstance, editingTax.id, taxData);
      setTaxes(prev => prev.map(tax => 
        tax.id === editingTax.id ? updatedTax : tax
      ));
      setSuccess("Tax updated successfully");
      setShowForm(false);
      setEditingTax(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update tax");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditTax = (tax) => {
    setEditingTax(tax);
    setShowForm(true);
  };

  const handleDeleteTax = async (taxId) => {
    if (!window.confirm("Are you sure you want to delete this tax? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      await deleteTax(axiosInstance, taxId);
      setTaxes(prev => prev.filter(tax => tax.id !== taxId));
      setSuccess("Tax deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete tax");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateTax = async (taxId) => {
    if (!window.confirm("Are you sure you want to deactivate this tax?")) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      const updatedTax = await deactivateTax(axiosInstance, taxId);
      setTaxes(prev => prev.map(tax => 
        tax.id === taxId ? { ...tax, is_active: false } : tax
      ));
      setSuccess("Tax deactivated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to deactivate tax");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (taxData) => {
    if (editingTax) {
      handleUpdateTax(taxData);
    } else {
      handleCreateTax(taxData);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTax(null);
  };

  const getStats = () => {
    const total = taxes.length;
    const active = taxes.filter(tax => tax.is_active).length;
    const sales = taxes.filter(tax => tax.applicable_on === "sales" || tax.applicable_on === "both").length;
    const purchase = taxes.filter(tax => tax.applicable_on === "purchase" || tax.applicable_on === "both").length;
    
    return { total, active, sales, purchase };
  };

  const stats = getStats();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tax Management</h1>
          <p className="text-gray-600 mt-2">Manage tax rates and configurations</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Tax
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Taxes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 font-bold text-lg">S</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sales Taxes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.sales}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-orange-600 font-bold text-lg">P</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Purchase Taxes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.purchase}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      {/* Tax List */}
      <TaxList
        taxes={taxes}
        onEdit={handleEditTax}
        onDelete={handleDeleteTax}
        onDeactivate={handleDeactivateTax}
        loading={loading}
      />

      {/* Tax Form Modal */}
      <TaxForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingTax}
        loading={formLoading}
      />
    </div>
  );
}
