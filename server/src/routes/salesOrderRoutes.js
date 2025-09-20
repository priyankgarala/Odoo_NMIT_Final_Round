import express from "express";
import {
  createSalesOrderController,
  confirmSalesOrderController,
  generateCustomerInvoiceController
} from "../controllers/salesOrderController.js";

const router = express.Router();

router.post("/", createSalesOrderController);
router.put("/:id/confirm", confirmSalesOrderController);
router.put("/:id/invoice", generateCustomerInvoiceController);

export default router;
