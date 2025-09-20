import {
  createSalesOrder,
  confirmSalesOrder,
  generateCustomerInvoice
} from "../services/salesOrderService.js";

// POST /api/sales-orders
export const createSalesOrderController = async (req, res) => {
  try {
    const { orderData, items } = req.body;
    const newSO = await createSalesOrder(orderData, items);
    res.status(201).json({ message: "Sales Order created", data: newSO });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/sales-orders/:id/confirm
export const confirmSalesOrderController = async (req, res) => {
  try {
    const soId = req.params.id;
    const confirmedSO = await confirmSalesOrder(soId);
    res.json({ message: "Sales Order confirmed", data: confirmedSO });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/sales-orders/:id/invoice
export const generateCustomerInvoiceController = async (req, res) => {
  try {
    const soId = req.params.id;
    const invoice = await generateCustomerInvoice(soId);
    res.json({ message: "Customer Invoice generated", data: invoice });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
