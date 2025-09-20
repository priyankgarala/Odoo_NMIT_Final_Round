import {
  createSalesOrder,
  confirmSalesOrder,
  generateCustomerInvoice
} from "../services/salesOrderServices.js";

// POST /api/sales-orders
export const createSalesOrderController = async (req, res) => {
  try {
    const { customer_id, order_date, status, tax_percentage, items } = req.body;
    
    // Calculate totals
    const total_amount = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const tax_amount = (total_amount * tax_percentage) / 100;
    const grand_total = total_amount + tax_amount;
    
    const orderData = {
      customer_id,
      order_date,
      status: status || 'DRAFT',
      total_amount,
      tax_amount,
      grand_total
    };
    
    // Transform items to include tax calculations
    const transformedItems = items.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      tax_rate: tax_percentage,
      tax_amount: (item.unit_price * item.quantity * tax_percentage) / 100,
      line_total: (item.unit_price * item.quantity) + ((item.unit_price * item.quantity * tax_percentage) / 100)
    }));
    
    const newSO = await createSalesOrder(orderData, transformedItems, req.user.id);
    res.status(201).json({ message: "Sales Order created successfully", data: newSO });
  } catch (error) {
    console.error("Error creating sales order:", error);
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
