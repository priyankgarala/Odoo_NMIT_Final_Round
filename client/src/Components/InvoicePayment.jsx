"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getCustomerInvoiceById, updateInvoiceStatus } from "../api/salesOrder"
import axiosInstance from "../utils/axiosInstance"
import { CreditCard, FileText, Calendar, User, DollarSign, ArrowLeft, CheckCircle, AlertCircle, Receipt, Banknote, Smartphone, Building2 } from "lucide-react"

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

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'online':
        return <Smartphone className="w-4 h-4" />
      case 'bank_transfer':
        return <Building2 className="w-4 h-4" />
      case 'cash':
        return <Banknote className="w-4 h-4" />
      case 'check':
        return <Receipt className="w-4 h-4" />
      case 'credit_card':
        return <CreditCard className="w-4 h-4" />
      default:
        return <DollarSign className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/50">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Loading Invoice</h3>
            <p className="text-slate-600">Please wait while we fetch the invoice details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/50 max-w-md w-full mx-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Error Loading Invoice</h3>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/my-invoices")}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium hover:-translate-y-0.5"
            >
              Back to Invoices
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent mb-3">
                  Invoice Payment
                </h1>
                <p className="text-slate-600 text-lg">Process payment for invoice #{invoice?.invoice_number}</p>
              </div>
              <button
                onClick={() => navigate("/my-invoices")}
                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-medium hover:-translate-y-0.5"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Invoices
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-800 px-6 py-4 rounded-2xl shadow-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-3" />
              {error}
            </div>
          </div>
        )}

        {invoice && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Invoice Details */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-8 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-blue-600" />
                Invoice Details
              </h2>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-center">
                    <Receipt className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="text-slate-600 font-medium">Invoice Number:</span>
                  </div>
                  <span className="text-slate-800 font-mono font-semibold">{invoice.invoice_number}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-slate-600 mr-3" />
                    <span className="text-slate-600 font-medium">Customer:</span>
                  </div>
                  <span className="text-slate-800 font-semibold">{invoice.customer_name}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-slate-600 mr-3" />
                    <span className="text-slate-600 font-medium">Invoice Date:</span>
                  </div>
                  <span className="text-slate-800 font-semibold">{formatDate(invoice.invoice_date)}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-slate-600 mr-3" />
                    <span className="text-slate-600 font-medium">Due Date:</span>
                  </div>
                  <span className="text-slate-800 font-semibold">{formatDate(invoice.due_date)}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
                  <span className="text-slate-600 font-medium">Status:</span>
                  <span className={`px-4 py-2 rounded-xl border font-medium text-sm ${getStatusColor(invoice.status)}`}>
                    {invoice.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="border-t border-slate-200 pt-6">
                  <div className="flex justify-between items-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border-2 border-blue-200">
                    <div className="flex items-center">
                      <DollarSign className="w-6 h-6 text-blue-600 mr-3" />
                      <span className="text-slate-700 text-lg font-medium">Total Amount:</span>
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                      {formatCurrency(invoice.total_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              {invoice.items && invoice.items.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
                    <Receipt className="w-5 h-5 mr-2 text-blue-600" />
                    Invoice Items ({invoice.items.length})
                  </h3>
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 space-y-4">
                    {invoice.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                        <div className="flex-1">
                          <span className="text-slate-700 font-medium">{item.product_name}</span>
                          <span className="text-slate-500 text-sm ml-2">(x{item.quantity})</span>
                        </div>
                        <span className="text-slate-800 font-semibold">{formatCurrency(item.line_total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Form */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-8 flex items-center">
                <CreditCard className="w-6 h-6 mr-3 text-blue-600" />
                Payment Information
              </h2>
              
              <form onSubmit={handlePayment} className="space-y-6">
                {/* Payment Type */}
                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-3">
                    Payment Type
                  </label>
                  <select
                    name="payment_type"
                    value={paymentData.payment_type}
                    onChange={handlePaymentChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                  >
                    <option value="receive">Receive Payment (Customer Invoice)</option>
                    <option value="send">Send Payment (Billing Invoice)</option>
                  </select>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-3">
                    Payment Method
                  </label>
                  <select
                    name="payment_method"
                    value={paymentData.payment_method}
                    onChange={handlePaymentChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
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
                  <label className="block text-slate-700 text-sm font-semibold mb-3">
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
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all"
                    required
                  />
                  <p className="text-slate-500 text-sm mt-2 flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Maximum: {formatCurrency(invoice.total_amount)}
                  </p>
                </div>

                {/* Payment Notes */}
                <div>
                  <label className="block text-slate-700 text-sm font-semibold mb-3">
                    Payment Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={paymentData.notes}
                    onChange={handlePaymentChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all resize-none"
                    placeholder="Add any payment notes..."
                  />
                </div>

                {/* Payment Summary */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
                  <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                    {getPaymentMethodIcon(paymentData.payment_method)}
                    <span className="ml-2">Payment Summary</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white/70 rounded-xl">
                      <span className="text-slate-600 font-medium">Invoice Total:</span>
                      <span className="text-slate-800 font-semibold">{formatCurrency(invoice.total_amount)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/70 rounded-xl">
                      <span className="text-slate-600 font-medium">Payment Amount:</span>
                      <span className="text-slate-800 font-semibold">{formatCurrency(paymentData.amount)}</span>
                    </div>
                    <div className="border-t border-blue-200 pt-3">
                      <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                        <span className="text-slate-700 font-semibold">Remaining:</span>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
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
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-slate-400 disabled:to-slate-500 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl disabled:shadow-none transition-all duration-300 font-semibold text-lg hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      Process Payment
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}