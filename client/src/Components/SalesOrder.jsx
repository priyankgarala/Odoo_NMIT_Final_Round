"use client"

import { useState, useEffect } from "react"
import { getCustomers } from "../api/contact"
import { getPublicProducts } from "../api/product"
import { createSalesOrder } from "../api/salesOrder"
import axiosInstance from "../utils/axiosInstance"
import { calculateProductTaxes } from "../utils/taxCalculator"

const initialOrder = {
  customer_id: "",
  order_date: new Date().toISOString().slice(0, 10),
  status: "DRAFT",
  tax_percentage: 0,
  items: [],
}

function SalesOrder() {
  const [order, setOrder] = useState(initialOrder)
  const [item, setItem] = useState({ product_id: "", quantity: 1 })
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError("")
    try {
      const [customersData, productsData] = await Promise.all([
        getCustomers(axiosInstance),
        getPublicProducts(axiosInstance)
      ])
      setCustomers(customersData.contacts || [])
      setProducts(productsData || [])
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const handleOrderChange = (e) => {
    setOrder({ ...order, [e.target.name]: e.target.value })
  }

  const handleItemChange = (e) => {
    setItem({ ...item, [e.target.name]: e.target.value })
  }

  const addItem = () => {
    const prod = products.find((p) => p.id === Number(item.product_id))
    if (!prod) return
    
    const quantity = Number(item.quantity)
    const unit_price = prod.sales_price
    const untaxed_amount = unit_price * quantity

    setOrder({
      ...order,
      items: [
        ...order.items,
        {
          ...item,
          product_name: prod.name,
          unit_price,
          untaxed_amount,
        },
      ],
    })
    setItem({ product_id: "", quantity: 1 })
  }

  const removeItem = (idx) => {
    setOrder({
      ...order,
      items: order.items.filter((_, i) => i !== idx),
    })
  }

  const handleSaveOrder = async () => {
    if (!order.customer_id || order.items.length === 0) {
      setError("Please select a customer and add at least one item")
      return
    }

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const salesOrderData = {
        customer_id: order.customer_id,
        order_date: order.order_date,
        status: order.status,
        tax_percentage: order.tax_percentage,
        items: order.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      }

      const result = await createSalesOrder(salesOrderData)
      setSuccess("Sales Order saved successfully!")
      
      // Reset form
      setOrder(initialOrder)
      setItem({ product_id: "", quantity: 1 })
      
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save sales order")
    } finally {
      setSaving(false)
    }
  }

  const total_untaxed_amount = order.items.reduce((sum, i) => sum + i.untaxed_amount, 0)
  const total_tax_amount = (total_untaxed_amount * order.tax_percentage) / 100
  const grand_total = total_untaxed_amount + total_tax_amount

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto bg-gray-900 rounded-2xl border border-gray-700 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-white">Sales Order</h1>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors">
              Home
            </button>
            <button className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors">
              Back
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span className="ml-2 text-white">Loading...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Success State */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div>
            <label className="block text-pink-400 text-sm font-medium mb-2">Customer Name</label>
            <select
              name="customer_id"
              value={order.customer_id}
              onChange={handleOrderChange}
              disabled={loading}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              required
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-pink-400 text-sm font-medium mb-2">Order Date</label>
            <input
              type="date"
              name="order_date"
              value={order.order_date}
              onChange={handleOrderChange}
              disabled={loading}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-pink-400 text-sm font-medium mb-2">Status</label>
            <select
              name="status"
              value={order.status}
              onChange={handleOrderChange}
              disabled={loading}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="DRAFT">DRAFT</option>
              
            </select>
          </div>

          <div>
            <label className="block text-pink-400 text-sm font-medium mb-2">Tax Percentage (%)</label>
            <input
              type="number"
              name="tax_percentage"
              value={order.tax_percentage}
              onChange={handleOrderChange}
              disabled={loading}
              min="0"
              max="100"
              step="0.01"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Add Items Section */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-white mb-4">Add Items</h3>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-48">
              <label className="block text-pink-400 text-sm font-medium mb-2">Product</label>
              <select
                name="product_id"
                value={item.product_id}
                onChange={handleItemChange}
                disabled={loading}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Product</option>
                {products.map((p) => {
                  const taxCalculation = calculateProductTaxes(p)
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} (₹{p.sales_price.toFixed(2)})
                    </option>
                  )
                })}
              </select>
            </div>

            <div className="w-24">
              <label className="block text-pink-400 text-sm font-medium mb-2">Qty</label>
              <input
                type="number"
                name="quantity"
                min={1}
                value={item.quantity}
                onChange={handleItemChange}
                disabled={loading}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="button"
              onClick={addItem}
              disabled={!item.product_id || loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              Add Item
            </button>
          </div>
        </div>

        {/* Items Table */}
        {order.items.length > 0 && (
          <div className="mb-8 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Product</th>
                  <th className="text-center py-3 px-4 text-gray-300 font-medium">Unit</th>
                  <th className="text-right py-3 px-4 text-gray-300 font-medium">Unit Price</th>
                  <th className="text-right py-3 px-4 text-gray-300 font-medium">Untaxed Amount</th>
                  <th className="text-center py-3 px-4 text-gray-300 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it, idx) => (
                  <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3 px-4 text-white">{it.product_name}</td>
                    <td className="py-3 px-4 text-center text-white">{it.quantity}</td>
                    <td className="py-3 px-4 text-right text-white">₹{it.unit_price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-white">₹{it.untaxed_amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="bg-gray-800 rounded-lg p-6 min-w-80">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-300">
                <span>Untaxed Amount:</span>
                <span>₹{total_untaxed_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Tax:</span>
                <span>₹{total_tax_amount.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-600 pt-2">
                <div className="flex justify-between text-white font-semibold text-lg">
                  <span>Grand Total:</span>
                  <span>₹{grand_total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            type="button"
            disabled={!order.customer_id || order.items.length === 0 || saving}
            onClick={handleSaveOrder}
            className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {saving ? "Saving..." : "Save Sales Order"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SalesOrder
