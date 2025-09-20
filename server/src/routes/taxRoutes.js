import { Router } from "express";
import taxController from "../controllers/taxController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

// All tax routes require authentication
router.use(authenticateToken);

// CRUD operations for taxes
router.post("/", taxController.create_tax);
router.get("/", taxController.get_taxes);
router.get("/:id", taxController.get_tax);
router.put("/:id", taxController.update_tax);
router.delete("/:id", taxController.delete_tax);
router.patch("/:id/deactivate", taxController.deactivate_tax);

export default router;
