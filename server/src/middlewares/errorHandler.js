import { verifyToken } from "../utils/helper.js";
import { findUserById } from "../microservices/user.dao.js";
import HttpError from "../utils/HttpError.js";

export const authenticateToken = async (req, res, next) => {
    try {
        // Get token from cookies
        const token = req.cookies.accessToken;
        
        if (!token) throw HttpError.unauthorized("Access token required");

        // Verify the token
        const userId = verifyToken(token);
        
        // Find user by ID
        const user = await findUserById(userId);
        
        if (!user) throw HttpError.unauthorized("User not found");

        // Set user in request object
        req.user = user;
        next();
    } catch (error) {
        return next(HttpError.unauthorized(error.message || "Invalid or expired token"));
    }
};
