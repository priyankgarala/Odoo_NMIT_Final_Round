import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users, Calculator, Package, Settings } from 'lucide-react'
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

  if (loading) return <div className="p-6">Loading products...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to your Odoo-style management system</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link 
          to="/admin/users" 
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
              <p className="text-sm text-gray-600">Manage users and roles</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/admin/taxes" 
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calculator className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Tax Management</h3>
              <p className="text-sm text-gray-600">Configure tax rates</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/admin/products" 
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Product Management</h3>
              <p className="text-sm text-gray-600">Manage products and inventory</p>
            </div>
          </div>
        </Link>

        <Link 
          to="/admin/tax-demo" 
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calculator className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Tax Calculator</h3>
              <p className="text-sm text-gray-600">Test tax calculations</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Latest Products Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Latest Products</h2>
            <Link 
              to="/admin/products" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
          </div>
        </div>
        
        <div className="p-6">
          {products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No products available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="border rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <h3 className="font-semibold text-gray-900 mb-2">{p.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{p.description || 'No description'}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {formatPrice(p.sales_price || p.price)}
                      </div>
                      {(() => {
                        const taxCalculation = calculateProductTaxes(p);
                        if (taxCalculation.total_sales_tax > 0) {
                          return (
                            <div className="text-xs text-gray-500">
                              +{formatPrice(taxCalculation.total_sales_tax)} tax
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                      {p.type || 'goods'}
                    </span>
                  </div>
                  {p.image_url && (
                    <img src={p.image_url} alt={p.name} className="mt-3 rounded w-full h-32 object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard;