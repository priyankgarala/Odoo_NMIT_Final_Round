import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users, Calculator, Package, Settings, FileText, ShoppingCart, TrendingUp, BarChart3 } from 'lucide-react'
import axiosInstance from '../utils/axiosInstance'
import { getPublicProducts } from '../api/product'
import { calculateProductTaxes, formatPrice } from '../utils/taxCalculator'

const Dashboard = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    getPublicProducts(axiosInstance)
      .then(setProducts)
      .catch(err => setError(err?.response?.data?.message || err?.message || 'Failed to load products'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-slate-600 font-medium">Loading products...</p>
      </div>
    </div>
  )
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Error Loading Data</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent mb-3">
                  Dashboard
                </h1>
                <p className="text-slate-600 text-lg">Welcome to your comprehensive management system</p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-3 text-blue-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link 
              to="/admin/users" 
              className="group bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 hover:border-blue-200 hover:-translate-y-1"
            >
              <div className="flex items-center">
                <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                  <Users className="w-7 h-7 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">User Management</h3>
                  <p className="text-sm text-slate-500">Manage users and roles</p>
                </div>
              </div>
            </Link>

            <Link 
              to="/admin/taxes" 
              className="group bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 hover:border-emerald-200 hover:-translate-y-1"
            >
              <div className="flex items-center">
                <div className="p-4 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl group-hover:from-emerald-200 group-hover:to-emerald-300 transition-all duration-300">
                  <Calculator className="w-7 h-7 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">Tax Management</h3>
                  <p className="text-sm text-slate-500">Configure tax rates</p>
                </div>
              </div>
            </Link>

            <Link 
              to="/admin/products" 
              className="group bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 hover:border-purple-200 hover:-translate-y-1"
            >
              <div className="flex items-center">
                <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300">
                  <Package className="w-7 h-7 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-slate-800 group-hover:text-purple-600 transition-colors">Product Management</h3>
                  <p className="text-sm text-slate-500">Manage products and inventory</p>
                </div>
              </div>
            </Link>

            <Link 
              to="/admin/tax-demo" 
              className="group bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 hover:border-orange-200 hover:-translate-y-1"
            >
              <div className="flex items-center">
                <div className="p-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300">
                  <Calculator className="w-7 h-7 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-slate-800 group-hover:text-orange-600 transition-colors">Tax Calculator</h3>
                  <p className="text-sm text-slate-500">Test tax calculations</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Business Operations */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center">
            <Settings className="w-6 h-6 mr-3 text-blue-600" />
            Business Operations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link 
              to="/admin/sales-orders" 
              className="group bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 hover:border-emerald-200 hover:-translate-y-1"
            >
              <div className="flex items-center">
                <div className="p-4 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl group-hover:from-emerald-200 group-hover:to-emerald-300 transition-all duration-300">
                  <ShoppingCart className="w-7 h-7 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">Sales Orders</h3>
                  <p className="text-sm text-slate-500">Create and manage sales orders</p>
                </div>
              </div>
            </Link>

            <Link 
              to="/my-invoices" 
              className="group bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 hover:border-blue-200 hover:-translate-y-1"
            >
              <div className="flex items-center">
                <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                  <FileText className="w-7 h-7 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">My Invoices</h3>
                  <p className="text-sm text-slate-500">View and manage your invoices</p>
                </div>
              </div>
            </Link>

            <Link 
              to="/admin/purchase-orders" 
              className="group bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 hover:border-purple-200 hover:-translate-y-1"
            >
              <div className="flex items-center">
                <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300">
                  <Package className="w-7 h-7 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-slate-800 group-hover:text-purple-600 transition-colors">Purchase Orders</h3>
                  <p className="text-sm text-slate-500">Manage vendor orders</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Latest Products Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50">
          <div className="px-8 py-6 border-b border-slate-200/50">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-slate-800 flex items-center">
                <Package className="w-6 h-6 mr-3 text-blue-600" />
                Latest Products
              </h2>
              <Link 
                to="/admin/products" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-medium hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </Link>
            </div>
          </div>
          
          <div className="p-8">
            {products.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Package className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No Products Yet</h3>
                <p className="text-slate-500">Get started by adding your first product to the system.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(p => (
                  <div key={p.id} className="group bg-gradient-to-br from-white to-slate-50 border border-slate-200/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-200">
                    {p.image_url && (
                      <div className="mb-4 overflow-hidden rounded-xl">
                        <img 
                          src={p.image_url} 
                          alt={p.name} 
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">{p.name}</h3>
                      <span className="text-xs bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-3 py-1 rounded-full font-medium shrink-0 ml-2">
                        {p.type || 'goods'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{p.description || 'No description available'}</p>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                          {formatPrice(p.sales_price || p.price)}
                        </div>
                        {(() => {
                          const taxCalculation = calculateProductTaxes(p);
                          if (taxCalculation.total_sales_tax > 0) {
                            return (
                              <div className="text-xs text-slate-500 mt-1">
                                +{formatPrice(taxCalculation.total_sales_tax)} tax
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard;