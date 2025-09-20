"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getUserInvoices, updateInvoiceStatus } from "../api/salesOrder"
import axiosInstance from "../utils/axiosInstance"

export default function UserInvoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState(null)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    setLoading(true)
    setError("")
    try {
      const result = await getUserInvoices()
      setInvoices(result.data || [])
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch invoices")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (userInvoiceId, newStatus) => {
    setUpdatingStatus(userInvoiceId)
    setError("")
    try {
      await updateInvoiceStatus(userInvoiceId, newStatus)
      setSuccess("Invoice status updated successfully!")
      
      // Refresh the invoices list
      await fetchInvoices()
      
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update invoice status")
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'UNPAID':
        return 'bg-red-100 text-red-800'
      case 'PARTIALLY_PAID':
        return 'bg-yellow-100 text-yellow-800'
      case 'PAID':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto bg-gray-900 rounded-2xl border border-gray-700 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-white">My Invoices</h1>
          <button
            onClick={fetchInvoices}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

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

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span className="ml-2 text-white">Loading invoices...</span>
          </div>
        )}

        {/* Invoices Table */}
        {!loading && invoices.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Invoice #</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Customer</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Invoice Date</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Due Date</th>
                  <th className="text-right py-3 px-4 text-gray-300 font-medium">Amount Due</th>
                  <th className="text-center py-3 px-4 text-gray-300 font-medium">Status</th>
                  <th className="text-center py-3 px-4 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3 px-4 text-white font-mono">{invoice.invoice_number}</td>
                    <td className="py-3 px-4 text-white">{invoice.customer_name}</td>
                    <td className="py-3 px-4 text-white">{formatDate(invoice.invoice_date)}</td>
                    <td className="py-3 px-4 text-white">{formatDate(invoice.due_date)}</td>
                    <td className="py-3 px-4 text-right text-white font-semibold">
                      {formatCurrency(invoice.amount_due)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.payment_status)}`}>
                        {invoice.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex gap-2 justify-center">
                        {invoice.payment_status === 'UNPAID' && (
                          <button
                            onClick={() => handleStatusUpdate(invoice.id, 'PARTIALLY_PAID')}
                            disabled={updatingStatus === invoice.id}
                            className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm"
                          >
                            {updatingStatus === invoice.id ? "Updating..." : "Partial"}
                          </button>
                        )}
                        {invoice.payment_status !== 'PAID' && (
                          <Link
                            to={`/invoice-payment/${invoice.customer_invoice_id}`}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm inline-block"
                          >
                            Pay Now
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!loading && invoices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">No invoices found</div>
            <p className="text-gray-500">Create a sales order and generate an invoice to see it here.</p>
          </div>
        )}

        {/* Summary */}
        {!loading && invoices.length > 0 && (
          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {formatCurrency(invoices.filter(inv => inv.payment_status === 'UNPAID').reduce((sum, inv) => sum + parseFloat(inv.amount_due), 0))}
                </div>
                <div className="text-gray-400 text-sm">Unpaid Amount</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {formatCurrency(invoices.filter(inv => inv.payment_status === 'PARTIALLY_PAID').reduce((sum, inv) => sum + parseFloat(inv.amount_due), 0))}
                </div>
                <div className="text-gray-400 text-sm">Partially Paid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {invoices.filter(inv => inv.payment_status === 'PAID').length}
                </div>
                <div className="text-gray-400 text-sm">Paid Invoices</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
