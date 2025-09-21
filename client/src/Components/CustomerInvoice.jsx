"use client"

import { useState } from "react"
import { Plus, Trash2, FileText, Printer, Send, X, Home, ArrowLeft, Calculator, ShoppingCart, Calendar, User, Tag, Package } from "lucide-react"

// Static data for demonstration
const customers = [
  { id: 1, name: "Acme Corp" },
  { id: 2, name: "Globex Inc" },
]

const products = [
  { id: 1, name: "Widget", price: 100 },
  { id: 2, name: "Gadget", price: 200 },
]

const taxes = [
  { id: 1, name: "GST 18%", rate: 0.18 },
  { id: 2, name: "VAT 5%", rate: 0.05 },
]

export default function CustomerInvoice() {
  const [invoice, setInvoice] = useState({
    invoice_number: "INV-1001",
    customer_id: 1,
    invoice_date: new Date().toISOString().slice(0, 10),
    due_date: "",
    status: "UNPAID",
    items: [],
  })

  const [item, setItem] = useState({
    product_id: "",
    quantity: 1,
    unit_price: "",
    tax_id: "",
  })

  const handleInvoiceChange = (e) => {
    setInvoice({ ...invoice, [e.target.name]: e.target.value })
  }

  const handleItemChange = (e) => {
    setItem({ ...item, [e.target.name]: e.target.value })
  }

  const addItem = () => {
    if (!item.product_id || !item.quantity || !item.unit_price) return
    setInvoice({
      ...invoice,
      items: [...invoice.items, { ...item, id: Date.now() }],
    })
    setItem({ product_id: "", quantity: 1, unit_price: "", tax_id: "" })
  }

  const removeItem = (id) => {
    setInvoice({
      ...invoice,
      items: invoice.items.filter((it) => it.id !== id),
    })
  }

  const getProduct = (id) => products.find((p) => p.id === Number(id))
  const getTax = (id) => taxes.find((t) => t.id === Number(id))

  const calcLineTotal = (it) => {
    const subtotal = Number(it.quantity) * Number(it.unit_price)
    const tax = it.tax_id ? subtotal * (getTax(it.tax_id)?.rate || 0) : 0
    return subtotal + tax
  }

  const totalAmount = invoice.items.reduce((sum, it) => sum + calcLineTotal(it), 0)

  const getStatusColor = (status) => {
    switch (status) {
      case 'UNPAID':
        return 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 border-red-200'
      case 'PARTIALLY_PAID':
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700 border-yellow-200'
      case 'PAID':
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-700 border-green-200'
      default:
        return 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border-slate-200'
    }
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
                  Customer Invoice
                </h1>
                <p className="text-slate-600 text-lg">Create and manage customer invoices</p>
              </div>
              <div className="flex gap-4">
                <button className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-medium hover:-translate-y-0.5">
                  <Home className="w-5 h-5" />
                  Home
                </button>
                <button className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-medium hover:-translate-y-0.5">
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form Container */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
          {/* Invoice Details */}
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center">
              <FileText className="w-6 h-6 mr-3 text-blue-600" />
              Invoice Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-3 flex items-center">
                  <Tag className="w-4 h-4 mr-2 text-blue-600" />
                  Invoice Number
                </label>
                <input
                  name="invoice_number"
                  value={invoice.invoice_number}
                  onChange={handleInvoiceChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-medium mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2 text-blue-600" />
                  Customer
                </label>
                <select
                  name="customer_id"
                  value={invoice.customer_id}
                  onChange={handleInvoiceChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-medium mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                  Invoice Date
                </label>
                <input
                  type="date"
                  name="invoice_date"
                  value={invoice.invoice_date}
                  onChange={handleInvoiceChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-medium mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                  Due Date
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={invoice.due_date}
                  onChange={handleInvoiceChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-medium mb-3">Status</label>
                <select
                  name="status"
                  value={invoice.status}
                  onChange={handleInvoiceChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                >
                  <option value="UNPAID">UNPAID</option>
                  <option value="PARTIALLY_PAID">PARTIALLY_PAID</option>
                  <option value="PAID">PAID</option>
                </select>
              </div>

              <div className="flex items-end">
                <div className={`px-4 py-2 rounded-xl border font-medium text-sm ${getStatusColor(invoice.status)}`}>
                  Current Status: {invoice.status.replace('_', ' ')}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-medium hover:-translate-y-0.5">
                <FileText className="w-5 h-5" />
                Confirm
              </button>
              <button className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-medium hover:-translate-y-0.5">
                <Printer className="w-5 h-5" />
                Print
              </button>
              <button className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-medium hover:-translate-y-0.5">
                <Send className="w-5 h-5" />
                Send
              </button>
              <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-medium hover:-translate-y-0.5">
                <X className="w-5 h-5" />
                Cancel
              </button>
              <button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-medium hover:-translate-y-0.5">
                <FileText className="w-5 h-5" />
                Create Bill
              </button>
            </div>
          </div>

          {/* Add Item Section */}
          <div className="mb-10">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-blue-600" />
                Add Item
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-2 flex items-center">
                    <Package className="w-4 h-4 mr-1 text-blue-600" />
                    Product
                  </label>
                  <select
                    name="product_id"
                    value={item.product_id}
                    onChange={handleItemChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                  >
                    <option value="">Select Product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-2">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={item.quantity}
                    onChange={handleItemChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-2">Unit Price</label>
                  <input
                    type="number"
                    name="unit_price"
                    min="0"
                    value={item.unit_price}
                    onChange={handleItemChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 text-sm font-medium mb-2">Tax</label>
                  <select
                    name="tax_id"
                    value={item.tax_id}
                    onChange={handleItemChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                  >
                    <option value="">No Tax</option>
                    {taxes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-medium hover:-translate-y-0.5"
                >
                  <Plus className="w-5 h-5" />
                  Add Item
                </button>
              </div>
            </div>
          </div>

          {/* Invoice Items Table */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center">
              <ShoppingCart className="w-6 h-6 mr-3 text-blue-600" />
              Invoice Items ({invoice.items.length})
            </h3>
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-left text-slate-700 font-semibold">Sr. No.</th>
                      <th className="px-6 py-4 text-left text-slate-700 font-semibold">Product</th>
                      <th className="px-6 py-4 text-left text-slate-700 font-semibold">Qty</th>
                      <th className="px-6 py-4 text-left text-slate-700 font-semibold">Unit Price</th>
                      <th className="px-6 py-4 text-left text-slate-700 font-semibold">Tax</th>
                      <th className="px-6 py-4 text-left text-slate-700 font-semibold">Line Total</th>
                      <th className="px-6 py-4 text-left text-slate-700 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((it, index) => (
                      <tr key={it.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-slate-700">{index + 1}</td>
                        <td className="px-6 py-4 text-slate-700 font-medium">{getProduct(it.product_id)?.name || ""}</td>
                        <td className="px-6 py-4 text-slate-700">{it.quantity}</td>
                        <td className="px-6 py-4 text-slate-700">₹{it.unit_price}</td>
                        <td className="px-6 py-4 text-slate-700">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                            {getTax(it.tax_id)?.name || "No Tax"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-semibold">₹{calcLineTotal(it).toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => removeItem(it.id)}
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {invoice.items.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                          <div className="flex flex-col items-center">
                            <ShoppingCart className="w-12 h-12 text-slate-300 mb-4" />
                            <p className="text-lg font-medium mb-2">No items added yet</p>
                            <p className="text-sm">Add items to your invoice using the form above</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Total Section */}
          <div className="flex justify-end">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 border-2 border-blue-200 shadow-lg">
              <div className="text-right">
                <div className="flex items-center justify-end mb-2">
                  <Calculator className="w-6 h-6 text-blue-600 mr-2" />
                  <span className="text-slate-600 text-lg">Total Amount</span>
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  ₹{totalAmount.toFixed(2)}
                </div>
                <p className="text-sm text-slate-500 mt-2">Including all taxes and charges</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}