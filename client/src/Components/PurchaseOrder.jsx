"use client"

import { useState, useEffect } from "react"
import { HomeIcon, ArrowLeftIcon } from "lucide-react"
import { getVendors } from "../api/contact.js"
import { getPublicProducts } from "../api/product.js"
import { createPurchaseOrder } from "../api/purchase_order.js"

const STATUS_OPTIONS = ["DRAFT", "CONFIRMED", "BILLED", "CANCELLED"]

export default function PurchaseOrderPage() {
  const [vendors, setVendors] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [order, setOrder] = useState({
    vendor_id: "",
    order_date: new Date().toISOString().slice(0, 10),
    status: "DRAFT",
    items: [],
  })
  const [item, setItem] = useState({
    product_id: "",
    quantity: 1,
    unit_price: 0,
    tax_rate: 0,
  })
  const [message, setMessage] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError("")
      try {
        const [vendorsData, productsData] = await Promise.all([
          getVendors(),
          getPublicProducts()
        ])
        setVendors(vendorsData.contacts || vendorsData || [])
        setProducts(productsData.products || productsData || [])
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load vendors and products. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const handleOrderChange = (e) => {
    setOrder({ ...order, [e.target.name]: e.target.value })
  }

  const handleItemChange = (e) => {
    setItem({ ...item, [e.target.name]: e.target.value })
  }

  const addItem = () => {
    const product = products.find((p) => p.id === Number(item.product_id))
    if (!product) return
    const quantity = Number.parseFloat(item.quantity)
    const unit_price = Number.parseFloat(item.unit_price || product.price)
    const tax_rate = Number.parseFloat(item.tax_rate)
    const line_total = quantity * unit_price
    const tax_amount = (line_total * tax_rate) / 100
    setOrder({
      ...order,
      items: [
        ...order.items,
        {
          ...item,
          product_id: product.id,
          product_name: product.name,
          quantity,
          unit_price,
          tax_rate,
          tax_amount,
          line_total,
        },
      ],
    })
    setItem({ product_id: "", quantity: 1, unit_price: 0, tax_rate: 0 })
  }

  const removeItem = (idx) => {
    setOrder({
      ...order,
      items: order.items.filter((_, i) => i !== idx),
    })
  }

  const calculateTotals = () => {
    let total_amount = 0
    let tax_amount = 0
    order.items.forEach((it) => {
      total_amount += it.line_total
      tax_amount += it.tax_amount
    })
    return {
      total_amount: total_amount.toFixed(2),
      tax_amount: tax_amount.toFixed(2),
      grand_total: (total_amount + tax_amount).toFixed(2),
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")
    
    try {
      const totals = calculateTotals()
      const payload = {
        orderData: {
          vendor_id: order.vendor_id,
          order_date: order.order_date,
          status: order.status,
          total_amount: parseFloat(totals.total_amount),
          tax_amount: parseFloat(totals.tax_amount),
          grand_total: parseFloat(totals.grand_total),
        },
        items: order.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate,
          tax_amount: item.tax_amount,
          line_total: item.line_total,
        }))
      }
      
      const res = await createPurchaseOrder(payload)
      setMessage("Purchase Order Created Successfully! ID: " + res.data?.id)
      setOrder({
        vendor_id: "",
        order_date: new Date().toISOString().slice(0, 10),
        status: "DRAFT",
        items: [],
      })
    } catch (err) {
      console.error("Error creating purchase order:", err)
      setError("Failed to create Purchase Order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const totals = calculateTotals()

  const getStatusVariant = (status) => {
    switch (status) {
      case "DRAFT":
        return "secondary"
      case "CONFIRMED":
        return "default"
      case "BILLED":
        return "default"
      case "CANCELLED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto bg-gray-900 rounded-2xl border border-gray-700 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">New</span>
            <h1 className="text-white text-2xl font-light">Purchase Order</h1>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-md text-sm transition-colors">
              <HomeIcon className="h-4 w-4" />
              Home
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-md text-sm transition-colors">
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" disabled={loading}>
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div>
                <label className="text-pink-400 text-sm block mb-2">PO No.</label>
                <div className="text-gray-300 text-sm">
                  P00001 <span className="text-gray-500 text-xs ml-2">(auto generate PO Number + 1 of last order)</span>
                </div>
              </div>

              <div>
                <label className="text-pink-400 text-sm block mb-2">Vendor Name</label>
                <select
                  value={order.vendor_id}
                  onChange={(e) => setOrder({ ...order, vendor_id: e.target.value })}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 bg-transparent border border-gray-600 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" className="bg-gray-800">
                    Azure Interior
                  </option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id.toString()} className="bg-gray-800 text-gray-300">
                      {v.name}
                    </option>
                  ))}
                </select>
                <div className="text-gray-500 text-xs mt-1">(from Contact Master - Many to one)</div>
              </div>

              <div>
                <label className="text-pink-400 text-sm block mb-2">Reference</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-transparent border-0 border-b-2 border-b-pink-500 text-gray-300 focus:outline-none focus:border-b-pink-400 rounded-none"
                  placeholder="REQ-25-0001"
                />
                <div className="text-gray-500 text-xs mt-1">Alpha numeric (text)</div>
              </div>
            </div>

            <div className="flex justify-end">
              <div>
                <label className="text-pink-400 text-sm block mb-2">PO Date</label>
                <div className="text-gray-300 text-sm">Date</div>
                <input
                  type="date"
                  name="order_date"
                  value={order.order_date}
                  onChange={handleOrderChange}
                  disabled={loading}
                  className="mt-2 px-3 py-2 bg-transparent border border-gray-600 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-3">
              <button
                type="button"
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
              >
                Confirm
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
              >
                Print
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
              >
                Send
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
              >
                Create Bill
              </button>
            </div>
            <div className="flex gap-4 text-xs text-gray-500">
              <span>Draft</span>
              <span>Confirm</span>
              <span>Cancelled</span>
            </div>
          </div>

          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-4 text-gray-300 text-sm">Sr. No.</th>
                  <th className="text-left p-4 text-gray-300 text-sm">Product</th>
                  <th className="text-center p-4 text-gray-300 text-sm">Qty</th>
                  <th className="text-center p-4 text-gray-300 text-sm">Unit Price</th>
                  <th className="text-center p-4 text-gray-300 text-sm">Untaxed Amount</th>
                  <th className="text-center p-4 text-gray-300 text-sm">Tax</th>
                  <th className="text-center p-4 text-gray-300 text-sm">Amount</th>
                  <th className="text-center p-4 text-gray-300 text-sm">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it, idx) => (
                  <tr key={idx} className="border-b border-gray-700">
                    <td className="p-4 text-gray-300">{idx + 1}</td>
                    <td className="p-4 text-gray-300">{it.product_name}</td>
                    <td className="p-4 text-center text-gray-300">{it.quantity}</td>
                    <td className="p-4 text-center text-gray-300">{it.unit_price}</td>
                    <td className="p-4 text-center text-gray-300">{it.line_total.toFixed(2)}</td>
                    <td className="p-4 text-center text-pink-400">{it.tax_rate}%</td>
                    <td className="p-4 text-center text-gray-300">{it.tax_amount.toFixed(2)}</td>
                    <td className="p-4 text-center text-gray-300">{(it.line_total + it.tax_amount).toFixed(2)}</td>
                  </tr>
                ))}

                {[...Array(6)].map((_, i) => (
                  <tr key={`empty-${i}`} className="border-b border-gray-700">
                    <td className="p-4">&nbsp;</td>
                    <td className="p-4">&nbsp;</td>
                    <td className="p-4">&nbsp;</td>
                    <td className="p-4">&nbsp;</td>
                    <td className="p-4">&nbsp;</td>
                    <td className="p-4">&nbsp;</td>
                    <td className="p-4">&nbsp;</td>
                    <td className="p-4">&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-gray-700 p-4">
              <div className="flex justify-between items-center">
                <span className="text-purple-400 text-lg">Total</span>
                <div className="flex gap-8 text-gray-300">
                  <span>{totals.total_amount}</span>
                  <span>{totals.tax_amount}</span>
                  <span className="border border-purple-400 px-4 py-1 rounded">{totals.grand_total}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 border border-gray-700 rounded-lg">
            <h3 className="text-gray-300 mb-4">Add Item</h3>
            <div className="grid grid-cols-5 gap-4 items-end">
              <select
                value={item.product_id}
                onChange={(e) => setItem({ ...item, product_id: e.target.value })}
                disabled={loading}
                className="px-3 py-2 bg-transparent border border-gray-600 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" className="bg-gray-800">
                  Select Product
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id.toString()} className="bg-gray-800 text-gray-300">
                    {p.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                name="quantity"
                min="1"
                step="0.01"
                value={item.quantity}
                onChange={handleItemChange}
                placeholder="Quantity"
                disabled={loading}
                className="px-3 py-2 bg-transparent border border-gray-600 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />

              <input
                type="number"
                name="unit_price"
                min="0"
                step="0.01"
                value={item.unit_price}
                onChange={handleItemChange}
                placeholder="Unit Price"
                disabled={loading}
                className="px-3 py-2 bg-transparent border border-gray-600 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />

              <input
                type="number"
                name="tax_rate"
                min="0"
                step="0.01"
                value={item.tax_rate}
                onChange={handleItemChange}
                placeholder="Tax Rate (%)"
                disabled={loading}
                className="px-3 py-2 bg-transparent border border-gray-600 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />

              <button
                type="button"
                onClick={addItem}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors"
              >
                Add
              </button>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={loading || order.items.length === 0}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors font-medium"
            >
              {loading ? "Creating..." : "Create Purchase Order"}
            </button>
          </div>
        </form>

        {loading && (
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
            <div className="text-blue-400">Loading...</div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
            <div className="text-red-400">{error}</div>
          </div>
        )}

        {message && (
          <div className="mt-6 p-4 bg-green-900/20 border border-green-700 rounded-lg">
            <div className="text-green-400">{message}</div>
          </div>
        )}
      </div>
    </div>
  )
}
