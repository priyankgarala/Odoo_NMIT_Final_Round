import express from "express";
import { createPurchaseOrderController, billPurchaseOrderController, confirmPurchaseOrderController } from "../controllers/purchaseOrderController.js";

const router = express.Router();

// POST /api/purchase-orders
router.post("/", createPurchaseOrderController);
// Confirm PO
router.put("/:id/confirm", confirmPurchaseOrderController);
// Bill PO
router.put("/:id/bill", billPurchaseOrderController);

export default router;