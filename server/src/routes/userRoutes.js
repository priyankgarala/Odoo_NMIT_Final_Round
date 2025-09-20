import express from 'express';
import userController from '../controllers/userController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Protected routes - require authentication
router.get('/me', authenticateToken, userController.getProfile);
router.put('/update', authenticateToken, userController.updateProfile);

export default router;
