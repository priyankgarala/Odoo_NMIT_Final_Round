import express from 'express';
import userManagementController from '../controllers/userManagementController.js';
import { authenticateToken, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/signup', userManagementController.userSignupController);
router.post('/login', userManagementController.loginUserController);
router.post('/verify-otp', userManagementController.verifyOtpController);

// Protected routes (authentication required)
router.get('/roles', authenticateToken, userManagementController.getAllRolesController);

// Admin only routes (require admin role)
router.post('/admin/create-user', authenticateToken, requireAdmin, userManagementController.adminCreateUserController);
router.get('/admin/users', authenticateToken, requireAdmin, userManagementController.getAllUsersController);

export default router;
