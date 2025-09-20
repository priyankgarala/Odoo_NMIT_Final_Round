import { 
  adminCreateUser, 
  userSignup, 
  loginUser, 
  verifyOtpAndCreateUser,
  getAllUsersWithRoles,
  getAllAvailableRoles 
} from "../services/userManagementServices.js";
import { sendMail } from "../utils/mailer.js";
import HttpError from "../utils/HttpError.js";

/**
 * Admin creates a user with specific role
 */
export const adminCreateUserController = async (req, res, next) => {
  try {
    const { name, loginId, email, password, roleId, contactData } = req.body;

    // Validate required fields
    if (!name || !loginId || !email || !password || !roleId) {
      return next(HttpError.badRequest("All required fields must be provided"));
    }

    const newUser = await adminCreateUser(name, loginId, email, password, roleId, contactData);

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        loginId: newUser.login_id,
        email: newUser.email,
        roleId: newUser.role_id
      }
    });
  } catch (error) {
    return next(HttpError.badRequest(error.message));
  }
};

/**
 * User signup (creates invoicing_user by default)
 */
export const userSignupController = async (req, res, next) => {
  try {
    const { name, loginId, email, password } = req.body;

    // Validate required fields
    if (!name || !loginId || !email || !password) {
      return next(HttpError.badRequest("All required fields must be provided"));
    }

    const { otp, email: userEmail } = await userSignup(name, loginId, email, password);
    
    // Send OTP email
    await sendMail(userEmail, "Your OTP Code", `Your OTP is: ${otp}`);
    
    res.status(200).json({
      message: "OTP sent successfully. Please verify to complete registration."
    });
  } catch (error) {
    return next(HttpError.badRequest(error.message));
  }
};

/**
 * Login user by login_id or email
 */
export const loginUserController = async (req, res, next) => {
  try {
    const { loginIdentifier, password } = req.body;

    if (!loginIdentifier || !password) {
      return next(HttpError.badRequest("Login identifier and password are required"));
    }

    const { token, user } = await loginUser(loginIdentifier, password);
    
    // Set cookie
    const { cookieOptions } = await import("../config/config.js");
    res.cookie("accessToken", token, cookieOptions);
    
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        loginId: user.login_id,
        email: user.email,
        role: user.role_name,
        permissions: user.permissions
      }
    });
  } catch (error) {
    return next(HttpError.unauthorized(error.message));
  }
};

/**
 * Verify OTP and complete user registration
 */
export const verifyOtpController = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(HttpError.badRequest("Email and OTP are required"));
    }

    const { token, user } = await verifyOtpAndCreateUser(email, otp);
    
    // Set cookie
    const { cookieOptions } = await import("../config/config.js");
    res.cookie("accessToken", token, cookieOptions);
    
    res.status(200).json({
      message: "User verified and registered successfully",
      user: {
        id: user.id,
        name: user.name,
        loginId: user.login_id,
        email: user.email,
        role: user.role_name
      }
    });
  } catch (error) {
    return next(HttpError.badRequest(error.message));
  }
};

/**
 * Get all users (admin only)
 */
export const getAllUsersController = async (req, res, next) => {
  try {
    const users = await getAllUsersWithRoles();
    res.status(200).json({
      message: "Users retrieved successfully",
      users
    });
  } catch (error) {
    return next(HttpError.internalServerError(error.message));
  }
};

/**
 * Get all available roles
 */
export const getAllRolesController = async (req, res, next) => {
  try {
    const roles = await getAllAvailableRoles();
    res.status(200).json({
      message: "Roles retrieved successfully",
      roles
    });
  } catch (error) {
    return next(HttpError.internalServerError(error.message));
  }
};

export default {
  adminCreateUserController,
  userSignupController,
  loginUserController,
  verifyOtpController,
  getAllUsersController,
  getAllRolesController
};
