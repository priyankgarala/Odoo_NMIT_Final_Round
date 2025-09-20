import React, { useEffect, useState } from 'react'
import axiosInstance from '../utils/axiosInstance'
import { getPublicProducts } from '../api/product'

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
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Latest Products</h1>
      {products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p._id} className="border rounded-xl p-4 bg-white shadow">
              <h3 className="font-semibold">{p.name}</h3>
              <p className="text-sm text-gray-600">{p.description}</p>
              <p className="mt-2 font-bold">${p.price}</p>
              {p.image_url && (
                <img src={p.image_url} alt={p.name} className="mt-2 rounded" />
              )}
            </div>
          ))}
        </div>
      )}
      {/* <LoadingSpinner fullscreen text="Loading Products" size={48} thickness={6} color='#10b981' /> */}
    </div>
  )
}

export default Dashboard;