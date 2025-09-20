"use client"

import { useState } from "react"

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

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Customer Invoice</h1>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
              Home
            </button>
            <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
              Back
            </button>
          </div>
        </div>

        {/* Main Form Container */}
        <div className="bg-gray-900 rounded-2xl border border-gray-700 p-8">
          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-pink-400 text-sm font-medium mb-2">Invoice Number</label>
              <input
                name="invoice_number"
                value={invoice.invoice_number}
                onChange={handleInvoiceChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-pink-400 text-sm font-medium mb-2">Customer</label>
              <select
                name="customer_id"
                value={invoice.customer_id}
                onChange={handleInvoiceChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-gray-800">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-pink-400 text-sm font-medium mb-2">Invoice Date</label>
              <input
                type="date"
                name="invoice_date"
                value={invoice.invoice_date}
                onChange={handleInvoiceChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-pink-400 text-sm font-medium mb-2">Due Date</label>
              <input
                type="date"
                name="due_date"
                value={invoice.due_date}
                onChange={handleInvoiceChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-pink-400 text-sm font-medium mb-2">Status</label>
              <select
                name="status"
                value={invoice.status}
                onChange={handleInvoiceChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="UNPAID" className="bg-gray-800">
                  UNPAID
                </option>
                <option value="PARTIALLY_PAID" className="bg-gray-800">
                  PARTIALLY_PAID
                </option>
                <option value="PAID" className="bg-gray-800">
                  PAID
                </option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
              Confirm
            </button>
            <button className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium">
              Print
            </button>
            <button className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium">
              Send
            </button>
            <button className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium">
              Cancel
            </button>
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
              Create Bill
            </button>
          </div>

          {/* Add Item Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Add Item</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-pink-400 text-sm font-medium mb-2">Product</label>
                <select
                  name="product_id"
                  value={item.product_id}
                  onChange={handleItemChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="" className="bg-gray-800">
                    Select Product
                  </option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id} className="bg-gray-800">
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-pink-400 text-sm font-medium mb-2">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  value={item.quantity}
                  onChange={handleItemChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-pink-400 text-sm font-medium mb-2">Unit Price</label>
                <input
                  type="number"
                  name="unit_price"
                  min="0"
                  value={item.unit_price}
                  onChange={handleItemChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-pink-400 text-sm font-medium mb-2">Tax</label>
                <select
                  name="tax_id"
                  value={item.tax_id}
                  onChange={handleItemChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="" className="bg-gray-800">
                    No Tax
                  </option>
                  {taxes.map((t) => (
                    <option key={t.id} value={t.id} className="bg-gray-800">
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={addItem}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Add Item
              </button>
            </div>
          </div>

          {/* Invoice Items Table */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Invoice Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-600 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="px-6 py-4 text-left text-pink-400 font-medium border-b border-gray-600">Sr. No.</th>
                    <th className="px-6 py-4 text-left text-pink-400 font-medium border-b border-gray-600">Product</th>
                    <th className="px-6 py-4 text-left text-pink-400 font-medium border-b border-gray-600">Qty</th>
                    <th className="px-6 py-4 text-left text-pink-400 font-medium border-b border-gray-600">
                      Unit Price
                    </th>
                    <th className="px-6 py-4 text-left text-pink-400 font-medium border-b border-gray-600">Tax</th>
                    <th className="px-6 py-4 text-left text-pink-400 font-medium border-b border-gray-600">
                      Line Total
                    </th>
                    <th className="px-6 py-4 text-left text-pink-400 font-medium border-b border-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((it, index) => (
                    <tr key={it.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                      <td className="px-6 py-4 text-white">{index + 1}</td>
                      <td className="px-6 py-4 text-white">{getProduct(it.product_id)?.name || ""}</td>
                      <td className="px-6 py-4 text-white">{it.quantity}</td>
                      <td className="px-6 py-4 text-white">₹{it.unit_price}</td>
                      <td className="px-6 py-4 text-white">{getTax(it.tax_id)?.name || "No Tax"}</td>
                      <td className="px-6 py-4 text-white">₹{calcLineTotal(it).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => removeItem(it.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {invoice.items.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                        No items added.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total Section */}
          <div className="flex justify-end">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-400">Total Amount: ₹{totalAmount.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
