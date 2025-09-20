import express from "express";
import { 
  get_contacts, 
  get_contact, 
  create_contact, 
  update_contact, 
  delete_contact 
} from "../controllers/contactController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes (no authentication required for basic contact info)
router.get("/", get_contacts);
router.get("/:id", get_contact);

// Protected routes (authentication required for modifications)
router.use(authenticateToken);

router.post("/", create_contact);
router.put("/:id", update_contact);
router.delete("/:id", delete_contact);

export default router;
