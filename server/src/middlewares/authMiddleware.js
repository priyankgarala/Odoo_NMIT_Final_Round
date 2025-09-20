import { verifyToken } from "../utils/helper.js";
import { findUserById } from "../microservices/user.dao.js";
import HttpError from "../utils/HttpError.js";

export const authenticateToken = async (req, res, next) => {
    try {
        // Get token from cookies
        const token = req.cookies.accessToken;
        
        if (!token) throw HttpError.unauthorized("Access token required");

        // Verify the token
        console.log("Token from cookie:", req.cookies.accessToken);
        const decoded = verifyToken(token);
        console.log("Decoded token payload:", decoded);
        
        // Find user by ID
        const user = await findUserById(decoded);
        console.log("User fetched from DB:", user);
        
        if (!user) throw HttpError.unauthorized("User not found");

        // Set user in request object with role information
        req.user = {
            ...user,
            role: decoded.role,
            permissions: decoded.permissions
        };
        next();
    } catch (error) {
        return next(HttpError.unauthorized(error.message || "Invalid or expired token"));
    }
};

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(HttpError.unauthorized("Authentication required"));
        }
        console.log(req.user)
        if (req.user.role_name !== 'admin') {
            return next(HttpError.forbidden("Admin access required"));
        }

        next();
    } catch (error) {
        return next(HttpError.forbidden(error.message || "Access denied"));
    }
};

/**
 * Middleware to check if user has specific permission
 */
export const requirePermission = (resource, action) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return next(HttpError.unauthorized("Authentication required"));
            }

            const permissions = req.user.permissions;
            if (!permissions || !permissions[resource] || !permissions[resource][action]) {
                return next(HttpError.forbidden(`Permission required: ${resource}.${action}`));
            }

            next();
        } catch (error) {
            return next(HttpError.forbidden(error.message || "Access denied"));
        }
    };
};
