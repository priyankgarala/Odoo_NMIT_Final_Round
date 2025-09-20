"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getCustomerInvoiceById, updateInvoiceStatus } from "../api/salesOrder"
import axiosInstance from "../utils/axiosInstance"

export default function InvoicePayment() {
  const { invoiceId } = useParams()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [processing, setProcessing] = useState(false)
  const [paymentData, setPaymentData] = useState({
    payment_method: 'online',
    amount: 0,
    payment_type: 'receive', // default for customer invoices
    notes: ''
  })

  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceDetails()
    }
  }, [invoiceId])

  const fetchInvoiceDetails = async () => {
    setLoading(true)
    setError("")
    try {
      const result = await getCustomerInvoiceById(invoiceId)
      const invoiceData = result.data
      setInvoice(invoiceData)
      
      // Set payment amount to the total amount due
      setPaymentData(prev => ({
        ...prev,
        amount: parseFloat(invoiceData.total_amount || 0)
      }))
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch invoice details")
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentChange = (e) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value
    })
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    
    if (!paymentData.amount || paymentData.amount <= 0) {
      setError("Please enter a valid payment amount")
      return
    }

    setProcessing(true)
    setError("")

    try {
      // For now, we'll just update the invoice status to PAID
      // In a real application, you would integrate with a payment gateway
      await updateInvoiceStatus(invoice.id, 'PAID')
      
      setError("")
      alert("Payment processed successfully!")
      navigate("/my-invoices")
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading invoice details...</p>
        </div>
      </div>
    )
  }

  if (error && !invoice) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <p className="text-white text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate("/my-invoices")}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Invoices
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto bg-gray-900 rounded-2xl border border-gray-700 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-white">Invoice Payment</h1>
          <button
            onClick={() => navigate("/my-invoices")}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Invoices
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {invoice && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Invoice Details */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Invoice Details</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Invoice Number:</span>
                  <span className="text-white font-mono">{invoice.invoice_number}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Customer:</span>
                  <span className="text-white">{invoice.customer_name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Invoice Date:</span>
                  <span className="text-white">{formatDate(invoice.invoice_date)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Due Date:</span>
                  <span className="text-white">{formatDate(invoice.due_date)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    invoice.status === 'UNPAID' ? 'bg-red-100 text-red-800' :
                    invoice.status === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
                
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-gray-400">Total Amount:</span>
                    <span className="text-white">{formatCurrency(invoice.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              {invoice.items && invoice.items.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Invoice Items</h3>
                  <div className="space-y-2">
                    {invoice.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-400">{item.product_name} (x{item.quantity})</span>
                        <span className="text-white">{formatCurrency(item.line_total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Form */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Payment Information</h2>
              
              <form onSubmit={handlePayment} className="space-y-6">
                {/* Payment Type */}
                <div>
                  <label className="block text-pink-400 text-sm font-medium mb-2">
                    Payment Type
                  </label>
                  <select
                    name="payment_type"
                    value={paymentData.payment_type}
                    onChange={handlePaymentChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="receive">Receive Payment (Customer Invoice)</option>
                    <option value="send">Send Payment (Billing Invoice)</option>
                  </select>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-pink-400 text-sm font-medium mb-2">
                    Payment Method
                  </label>
                  <select
                    name="payment_method"
                    value={paymentData.payment_method}
                    onChange={handlePaymentChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="online">Online Payment</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="credit_card">Credit Card</option>
                  </select>
                </div>

                {/* Payment Amount */}
                <div>
                  <label className="block text-pink-400 text-sm font-medium mb-2">
                    Payment Amount
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={paymentData.amount}
                    onChange={handlePaymentChange}
                    min="0"
                    step="0.01"
                    max={invoice.total_amount}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    Maximum: {formatCurrency(invoice.total_amount)}
                  </p>
                </div>

                {/* Payment Notes */}
                <div>
                  <label className="block text-pink-400 text-sm font-medium mb-2">
                    Payment Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={paymentData.notes}
                    onChange={handlePaymentChange}
                    rows="3"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="Add any payment notes..."
                  />
                </div>

                {/* Payment Summary */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Payment Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Invoice Total:</span>
                      <span className="text-white">{formatCurrency(invoice.total_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payment Amount:</span>
                      <span className="text-white">{formatCurrency(paymentData.amount)}</span>
                    </div>
                    <div className="border-t border-gray-600 pt-2">
                      <div className="flex justify-between text-lg font-semibold">
                        <span className="text-gray-400">Remaining:</span>
                        <span className="text-white">
                          {formatCurrency(invoice.total_amount - paymentData.amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={processing || paymentData.amount <= 0}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {processing ? "Processing Payment..." : "Process Payment"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
