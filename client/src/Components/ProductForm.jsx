import { useState, useEffect } from "react";
import { Loader2, X, Package, Tag, DollarSign, FileText, Hash, Layers, Calculator } from "lucide-react";
import TaxSelector from "./TaxSelector";
import axiosInstance from "../utils/axiosInstance";
import { createProduct, updateProduct } from "../api/product";

export default function ProductForm({ 
  isOpen, 
  onClose, 
  onSuccess, 
  initialData = null, 
  loading = false 
}) {
  const [formData, setFormData] = useState({
    name: "",
    type: "goods",
    sales_price: "",
    purchase_price: "",
    hsn_code: "",
    category: "",
    sales_taxes: [],
    purchase_taxes: []
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      console.log("Loading initial data for edit:", initialData); // Debug log
      console.log("Initial taxes:", initialData.taxes); // Debug log
      
      const salesTaxes = initialData.taxes?.filter(tax => tax.applicable_on === "sales") || [];
      const purchaseTaxes = initialData.taxes?.filter(tax => tax.applicable_on === "purchase") || [];
      
      console.log("Filtered sales taxes:", salesTaxes); // Debug log
      console.log("Filtered purchase taxes:", purchaseTaxes); // Debug log
      
      setFormData({
        name: initialData.name || "",
        type: initialData.type || "goods",
        sales_price: initialData.sales_price || "",
        purchase_price: initialData.purchase_price || "",
        hsn_code: initialData.hsn_code || "",
        category: initialData.category || "",
        sales_taxes: salesTaxes,
        purchase_taxes: purchaseTaxes
      });
    } else {
      setFormData({
        name: "",
        type: "goods",
        sales_price: "",
        purchase_price: "",
        hsn_code: "",
        category: "",
        sales_taxes: [],
        purchase_taxes: []
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleTaxChange = (applicableOn, taxes) => {
    setFormData(prev => ({
      ...prev,
      [`${applicableOn}_taxes`]: taxes
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.type) {
      newErrors.type = "Product type is required";
    }

    if (formData.sales_price && (isNaN(formData.sales_price) || formData.sales_price < 0)) {
      newErrors.sales_price = "Sales price must be a valid positive number";
    }

    if (formData.purchase_price && (isNaN(formData.purchase_price) || formData.purchase_price < 0)) {
      newErrors.purchase_price = "Purchase price must be a valid positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const productData = {
        ...formData,
        taxes: [...formData.sales_taxes, ...formData.purchase_taxes]
      };

      console.log("Submitting product data:", productData); // Debug log
      console.log("Sales taxes:", formData.sales_taxes); // Debug log
      console.log("Purchase taxes:", formData.purchase_taxes); // Debug log

      if (initialData) {
        await updateProduct(axiosInstance, initialData.id, productData);
      } else {
        await createProduct(axiosInstance, productData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving product:", err); // Debug log
      setErrors({ submit: err.response?.data?.message || "Failed to save product" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent flex items-center">
                <Package className="w-8 h-8 mr-3 text-blue-600" />
                {initialData ? "Edit Product" : "Create New Product"}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h4 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-3 flex items-center">
                      <Tag className="w-4 h-4 mr-2 text-blue-600" />
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all ${
                        errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/80' : 'border-slate-200'
                      }`}
                      placeholder="Enter product name"
                      required
                    />
                    {errors.name && (
                      <p className="text-red-600 text-sm font-medium flex items-center mt-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-3 flex items-center">
                      <Package className="w-4 h-4 mr-2 text-blue-600" />
                      Product Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                      required
                    >
                      <option value="goods">Goods</option>
                      <option value="service">Service</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                <h4 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-emerald-600" />
                  Pricing Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-3">
                      Sales Price
                    </label>
                    <input
                      type="number"
                      name="sales_price"
                      value={formData.sales_price}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all ${
                        errors.sales_price ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/80' : 'border-slate-200'
                      }`}
                      placeholder="0.00"
                    />
                    {errors.sales_price && (
                      <p className="text-red-600 text-sm font-medium flex items-center mt-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        {errors.sales_price}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-3">
                      Purchase Price
                    </label>
                    <input
                      type="number"
                      name="purchase_price"
                      value={formData.purchase_price}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all ${
                        errors.purchase_price ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/80' : 'border-slate-200'
                      }`}
                      placeholder="0.00"
                    />
                    {errors.purchase_price && (
                      <p className="text-red-600 text-sm font-medium flex items-center mt-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        {errors.purchase_price}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <h4 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
                  <Layers className="w-5 h-5 mr-2 text-purple-600" />
                  Additional Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-3 flex items-center">
                      <Hash className="w-4 h-4 mr-2 text-purple-600" />
                      HSN Code
                    </label>
                    <input
                      type="text"
                      name="hsn_code"
                      value={formData.hsn_code}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/80 backdrop-blur-sm transition-all"
                      placeholder="e.g., 8471"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 text-sm font-semibold mb-3 flex items-center">
                      <Layers className="w-4 h-4 mr-2 text-purple-600" />
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/80 backdrop-blur-sm transition-all"
                      placeholder="e.g., Electronics"
                    />
                  </div>
                </div>
              </div>

              {/* Tax Configuration */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
                <h4 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-orange-600" />
                  Tax Configuration
                </h4>
                
                <div className="space-y-6">
                  <TaxSelector
                    selectedTaxes={formData.sales_taxes}
                    onChange={(taxes) => handleTaxChange("sales", taxes)}
                    applicableOn="sales"
                  />

                  <TaxSelector
                    selectedTaxes={formData.purchase_taxes}
                    onChange={(taxes) => handleTaxChange("purchase", taxes)}
                    applicableOn="purchase"
                  />
                </div>
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-800 px-6 py-4 rounded-2xl shadow-lg">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    {errors.submit}
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-8 py-3 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border border-transparent rounded-xl disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:translate-y-0"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {initialData ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}