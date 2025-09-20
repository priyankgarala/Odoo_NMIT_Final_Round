import { createPurchaseOrder, confirmPurchaseOrder, billPurchaseOrder } from "../services/purchaseOrderServices.js";

export const createPurchaseOrderController = async (req, res) => {
  try {
    const { orderData, items } = req.body;

    if (!orderData || !items || items.length === 0) {
      return res.status(400).json({ message: "Order data and items are required" });
    }

    const newPO = await createPurchaseOrder(orderData, items);
    res.status(201).json({ message: "Purchase Order created successfully", data: newPO });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    res.status(500).json({ message: "Failed to create purchase order", error: error.message });
  }
};


export const confirmPurchaseOrderController = async (req, res) => {
  try {
    const poId = req.params.id;
    const updatedPO = await confirmPurchaseOrder(poId);
    res.json({ message: "Purchase Order confirmed", data: updatedPO });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const billPurchaseOrderController = async (req, res) => {
  try {
    const poId = req.params.id;
    const billedPO = await billPurchaseOrder(poId);
    res.json({ message: "Purchase Order billed successfully", data: billedPO });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
