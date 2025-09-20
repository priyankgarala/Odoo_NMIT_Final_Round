import express from "express";
import {
  getUserInvoicesController,
  getUserInvoiceByIdController,
  updateInvoiceStatusController
} from "../controllers/userInvoiceController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/user-invoices - Get all invoices for the logged-in user
router.get("/", getUserInvoicesController);

// GET /api/user-invoices/:id - Get specific invoice details
router.get("/:id", getUserInvoiceByIdController);

// PUT /api/user-invoices/:id/status - Update invoice payment status
router.put("/:id/status", updateInvoiceStatusController);

export default router;
