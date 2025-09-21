import { useState, useEffect } from "react";
import { Plus, Package, Edit, Trash2, Eye, Calculator, TrendingUp, DollarSign, Hash, Layers, Tag } from "lucide-react";
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
      goods: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-200",
      service: "bg-gradient-to-r from-green-100 to-green-200 text-green-700 border-green-200"
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${colors[type] || 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border-slate-200'}`}>
        {type?.charAt(0).toUpperCase() + type?.slice(1) || 'Unknown'}
      </span>
    );
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/50">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Loading Products</h3>
            <p className="text-slate-600">Please wait while we fetch your products...</p>
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
                  Product Management
                </h1>
                <p className="text-slate-600 text-lg">Manage your products and inventory ({products.length} products)</p>
              </div>
              <button
                onClick={handleCreateProduct}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-medium hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                Create Product
              </button>
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

        {/* Products Content */}
        {products.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-16 text-center">
            <div className="bg-gradient-to-br from-slate-100 to-slate-200 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-800 mb-4">No Products Yet</h3>
            <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
              Get started by creating your first product to begin managing your inventory
            </p>
            <button
              onClick={handleCreateProduct}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 mx-auto font-medium text-lg hover:-translate-y-0.5"
            >
              <Plus className="w-6 h-6" />
              Create Your First Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 hover:border-blue-200 hover:-translate-y-1">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1 mr-3">
                      <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors mb-2 leading-tight">
                        {product.name}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {product.description || 'No description available'}
                      </p>
                    </div>
                    {getProductTypeBadge(product.type)}
                  </div>

                  {/* Pricing Information */}
                  <div className="space-y-4 mb-6">
                    {(() => {
                      const taxCalculation = calculateProductTaxes(product);
                      return (
                        <>
                          {/* Sales Price */}
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center">
                                <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                                <span className="text-sm font-medium text-slate-700">Sales Price</span>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-600">
                                  {formatPrice(product.sales_price)}
                                </div>
                                {taxCalculation.total_sales_tax > 0 && (
                                  <div className="text-xs text-slate-500">
                                    +{formatPrice(taxCalculation.total_sales_tax)} tax
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                              </span>
                            </div>
                          </div>

                          {/* Purchase Price */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center">
                                <DollarSign className="w-4 h-4 text-blue-600 mr-2" />
                                <span className="text-sm font-medium text-slate-700">Purchase Price</span>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-blue-600">
                                  {formatPrice(product.purchase_price)}
                                </div>
                                {taxCalculation.total_purchase_tax > 0 && (
                                  <div className="text-xs text-slate-500">
                                    +{formatPrice(taxCalculation.total_purchase_tax)} tax
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                              </span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Additional Information */}
                  {(product.hsn_code || product.category) && (
                    <div className="space-y-3 mb-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                      {product.hsn_code && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Hash className="w-4 h-4 text-slate-600 mr-2" />
                            <span className="text-sm text-slate-600">HSN Code:</span>
                          </div>
                          <span className="text-sm font-medium text-slate-800 font-mono">
                            {product.hsn_code}
                          </span>
                        </div>
                      )}
                      {product.category && (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Layers className="w-4 h-4 text-slate-600 mr-2" />
                            <span className="text-sm text-slate-600">Category:</span>
                          </div>
                          <span className="text-sm font-medium text-slate-800">
                            {product.category}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tax Information */}
                  {product.taxes && product.taxes.length > 0 && (
                    <div className="mb-6">
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
                        <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                          <Calculator className="w-4 h-4 mr-2 text-orange-600" />
                          Applied Taxes
                        </p>
                        <div className="space-y-3">
                          {(() => {
                            const taxCalculation = calculateProductTaxes(product);
                            return (
                              <>
                                {taxCalculation.tax_breakdown.sales.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-green-600 mb-2">Sales Taxes:</p>
                                    <div className="space-y-1">
                                      {taxCalculation.tax_breakdown.sales.map((tax, index) => (
                                        <div key={index} className="flex justify-between items-center text-xs bg-white/60 rounded-lg p-2">
                                          <span className="text-slate-600">
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
                                    <p className="text-xs font-medium text-blue-600 mb-2">Purchase Taxes:</p>
                                    <div className="space-y-1">
                                      {taxCalculation.tax_breakdown.purchase.map((tax, index) => (
                                        <div key={index} className="flex justify-between items-center text-xs bg-white/60 rounded-lg p-2">
                                          <span className="text-slate-600">
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
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="p-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-300 hover:scale-110"
                      title="Edit product"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110"
                      title="Delete product"
                    >
                      <Trash2 className="w-5 h-5" />
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
    </div>
  );
}