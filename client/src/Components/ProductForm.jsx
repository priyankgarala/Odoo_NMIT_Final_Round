import { useState, useEffect } from "react";
import { Loader2, X, Package } from "lucide-react";
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              {initialData ? "Edit Product" : "Create New Product"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter product name"
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="goods">Goods</option>
                  <option value="service">Service</option>
                </select>
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sales Price
                </label>
                <input
                  type="number"
                  name="sales_price"
                  value={formData.sales_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.sales_price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.sales_price && (
                  <p className="text-red-500 text-xs mt-1">{errors.sales_price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Price
                </label>
                <input
                  type="number"
                  name="purchase_price"
                  value={formData.purchase_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.purchase_price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.purchase_price && (
                  <p className="text-red-500 text-xs mt-1">{errors.purchase_price}</p>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HSN Code
                </label>
                <input
                  type="text"
                  name="hsn_code"
                  value={formData.hsn_code}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 8471"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Electronics"
                />
              </div>
            </div>

            {/* Tax Selection */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Tax Configuration</h4>
              
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

            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errors.submit}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {initialData ? "Update Product" : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
