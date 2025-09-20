"use client"

import { useState } from "react"

// Static data for demonstration
const customers = [
  { id: 1, name: "Acme Corp" },
  { id: 2, name: "Globex Inc" },
]

const products = [
  { id: 1, name: "Widget", price: 100.0, taxRate: 18 },
  { id: 2, name: "Gadget", price: 250.0, taxRate: 12 },
]

const initialOrder = {
  customer_id: "",
  order_date: new Date().toISOString().slice(0, 10),
  status: "DRAFT",
  items: [],
}

function SalesOrder() {
  const [order, setOrder] = useState(initialOrder)
  const [item, setItem] = useState({ product_id: "", quantity: 1 })

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
    const unit_price = prod.price
    const tax_rate = prod.taxRate
    const tax_amount = (unit_price * quantity * tax_rate) / 100
    const line_total = unit_price * quantity + tax_amount

    setOrder({
      ...order,
      items: [
        ...order.items,
        {
          ...item,
          product_name: prod.name,
          unit_price,
          tax_rate,
          tax_amount,
          line_total,
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

  const total_amount = order.items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
  const tax_amount = order.items.reduce((sum, i) => sum + i.tax_amount, 0)
  const grand_total = total_amount + tax_amount

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

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-pink-400 text-sm font-medium mb-2">Customer Name</label>
            <select
              name="customer_id"
              value={order.customer_id}
              onChange={handleOrderChange}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
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
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-pink-400 text-sm font-medium mb-2">Status</label>
            <select
              name="status"
              value={order.status}
              onChange={handleOrderChange}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="DRAFT">DRAFT</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="INVOICED">INVOICED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
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
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₹{p.price})
                  </option>
                ))}
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
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="button"
              onClick={addItem}
              disabled={!item.product_id}
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
                  <th className="text-center py-3 px-4 text-gray-300 font-medium">Qty</th>
                  <th className="text-right py-3 px-4 text-gray-300 font-medium">Unit Price</th>
                  <th className="text-center py-3 px-4 text-gray-300 font-medium">Tax %</th>
                  <th className="text-right py-3 px-4 text-gray-300 font-medium">Tax Amt</th>
                  <th className="text-right py-3 px-4 text-gray-300 font-medium">Line Total</th>
                  <th className="text-center py-3 px-4 text-gray-300 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it, idx) => (
                  <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3 px-4 text-white">{it.product_name}</td>
                    <td className="py-3 px-4 text-center text-white">{it.quantity}</td>
                    <td className="py-3 px-4 text-right text-white">₹{it.unit_price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center text-white">{it.tax_rate}%</td>
                    <td className="py-3 px-4 text-right text-white">₹{it.tax_amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-white">₹{it.line_total.toFixed(2)}</td>
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
                <span>Total:</span>
                <span>₹{total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Tax:</span>
                <span>₹{tax_amount.toFixed(2)}</span>
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
            disabled={!order.customer_id || order.items.length === 0}
            onClick={() => alert("Order saved (static demo)")}
            className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Save Sales Order
          </button>
        </div>
      </div>
    </div>
  )
}

export default SalesOrder
