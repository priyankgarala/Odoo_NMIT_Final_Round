import {
  getUserInvoices,
  getUserInvoiceById,
  getCustomerInvoiceById,
  updateInvoicePaymentStatus
} from "../services/salesOrderServices.js";

// GET /api/user-invoices
export const getUserInvoicesController = async (req, res) => {
  try {
    const invoices = await getUserInvoices(req.user.id);
    res.json({ message: "User invoices retrieved successfully", data: invoices });
  } catch (error) {
    console.error("Error fetching user invoices:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/user-invoices/:id
export const getUserInvoiceByIdController = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const invoice = await getUserInvoiceById(invoiceId);
    res.json({ message: "Invoice retrieved successfully", data: invoice });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(404).json({ message: error.message });
  }
};

// PUT /api/user-invoices/:id/status
export const updateInvoiceStatusController = async (req, res) => {
  try {
    const { userInvoiceId, paymentStatus } = req.body;
    
    if (!userInvoiceId || !paymentStatus) {
      return res.status(400).json({ message: "userInvoiceId and paymentStatus are required" });
    }

    if (!['UNPAID', 'PARTIALLY_PAID', 'PAID'].includes(paymentStatus)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const result = await updateInvoicePaymentStatus(userInvoiceId, paymentStatus);
    res.json({ message: "Invoice status updated successfully", data: result });
  } catch (error) {
    console.error("Error updating invoice status:", error);
    res.status(400).json({ message: error.message });
  }
};
