import { Router } from "express";
import productController from "../controllers/productController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = Router();

// Public listings
router.get("/public", productController.get_public_products);

// Authenticated CRUD
router.use(authenticateToken);

router.post("/", productController.create_product);
router.get("/", productController.get_products);
router.get("/:id", productController.get_product);
router.put("/:id", productController.update_product);
router.delete("/:id", productController.delete_product);

export default router;


