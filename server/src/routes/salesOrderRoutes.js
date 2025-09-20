import express from "express";
import {
  createSalesOrderController,
  confirmSalesOrderController,
  generateCustomerInvoiceController
} from "../controllers/salesOrderController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateToken, createSalesOrderController);
router.put("/:id/confirm", authenticateToken, confirmSalesOrderController);
router.put("/:id/invoice", authenticateToken, generateCustomerInvoiceController);

export default router;
