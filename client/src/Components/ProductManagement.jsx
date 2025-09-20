import { useState, useEffect } from "react";
import { Plus, Package, Edit, Trash2, Eye, Calculator } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import { getMyProducts, deleteProduct } from "../api/product";
import ProductForm from "./ProductForm";
import { calculateProductTaxes, formatPrice, getTaxDisplayText } from "../utils/taxCalculator";

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("Fetching products..."); // Debug log
      const data = await getMyProducts(axiosInstance);
      console.log("Fetched products:", data); // Debug log
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err); // Debug log
      setError(err.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    console.log("Editing product:", product); // Debug log
    console.log("Product taxes:", product.taxes); // Debug log
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      await deleteProduct(axiosInstance, productId);
      setProducts(prev => prev.filter(product => product.id !== productId));
      setSuccess("Product deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    console.log("Form success callback triggered"); // Debug log
    fetchProducts();
    setSuccess(editingProduct ? "Product updated successfully" : "Product created successfully");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const getProductTypeBadge = (type) => {
    const colors = {
      goods: "bg-blue-100 text-blue-800",
      service: "bg-green-100 text-green-800"
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
        {type?.charAt(0).toUpperCase() + type?.slice(1) || 'Unknown'}
      </span>
    );
  };

  // Remove the old formatPrice function since we're importing it from utils

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-2">Manage your products and inventory</p>
        </div>
        <button
          onClick={handleCreateProduct}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Product
        </button>
      </div>

      {/* Error/Success Messages */}
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

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first product</p>
          <button
            onClick={handleCreateProduct}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Create Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {product.description || 'No description'}
                    </p>
                  </div>
                  {getProductTypeBadge(product.type)}
                </div>

                <div className="space-y-2 mb-4">
                  {(() => {
                    const taxCalculation = calculateProductTaxes(product);
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Sales Price:</span>
                          <div className="text-right">
                            <div className="text-sm font-medium text-green-600">
                              {formatPrice(product.sales_price)}
                            </div>
                            {taxCalculation.total_sales_tax > 0 && (
                              <div className="text-xs text-gray-500">
                                +{formatPrice(taxCalculation.total_sales_tax)} tax
                              </div>
                            )}
                            <div className="text-sm font-bold text-green-700">
                              Total: {formatPrice(taxCalculation.sales_price_with_tax)}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Purchase Price:</span>
                          <div className="text-right">
                            <div className="text-sm font-medium text-blue-600">
                              {formatPrice(product.purchase_price)}
                            </div>
                            {taxCalculation.total_purchase_tax > 0 && (
                              <div className="text-xs text-gray-500">
                                +{formatPrice(taxCalculation.total_purchase_tax)} tax
                              </div>
                            )}
                            <div className="text-sm font-bold text-blue-700">
                              Total: {formatPrice(taxCalculation.purchase_price_with_tax)}
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                  {product.hsn_code && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">HSN Code:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {product.hsn_code}
                      </span>
                    </div>
                  )}
                  {product.category && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {product.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tax Information */}
                {product.taxes && product.taxes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2 flex items-center">
                      <Calculator className="w-4 h-4 mr-1" />
                      Applied Taxes:
                    </p>
                    <div className="space-y-2">
                      {(() => {
                        const taxCalculation = calculateProductTaxes(product);
                        return (
                          <>
                            {taxCalculation.tax_breakdown.sales.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-green-600 mb-1">Sales Taxes:</p>
                                <div className="space-y-1">
                                  {taxCalculation.tax_breakdown.sales.map((tax, index) => (
                                    <div key={index} className="flex justify-between items-center text-xs">
                                      <span className="text-gray-600">
                                        {getTaxDisplayText(tax)}
                                      </span>
                                      <span className="font-medium text-green-600">
                                        {formatPrice(tax.tax_amount)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {taxCalculation.tax_breakdown.purchase.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-blue-600 mb-1">Purchase Taxes:</p>
                                <div className="space-y-1">
                                  {taxCalculation.tax_breakdown.purchase.map((tax, index) => (
                                    <div key={index} className="flex justify-between items-center text-xs">
                                      <span className="text-gray-600">
                                        {getTaxDisplayText(tax)}
                                      </span>
                                      <span className="font-medium text-blue-600">
                                        {formatPrice(tax.tax_amount)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50"
                    title="Edit product"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50"
                    title="Delete product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Form Modal */}
      <ProductForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
        initialData={editingProduct}
        loading={formLoading}
      />
    </div>
  );
}
