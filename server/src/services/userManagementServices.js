import { 
  createUser, 
  findUserByEmail, 
  findUserByLoginId, 
  checkLoginIdExists, 
  getAllUsers,
  findUserById 
} from "../microservices/user.dao.js";
import { getAllRoles, getRoleById } from "../microservices/role.dao.js";
import { createContact, linkContactToUser } from "../microservices/contact.dao.js";
import { upsertOtp, findOtpByEmail, deleteOtpByEmail } from "../microservices/user.dao.js";
import { signToken } from "../utils/helper.js";
import crypto from 'crypto';
import { sendMail } from "../utils/mailer.js";
import bcrypt from 'bcrypt';

/**
 * Admin creates a user with specific role
 */
export const adminCreateUser = async (name, loginId, email, password, roleId, contactData = null) => {
  // Validate login_id uniqueness
  const loginIdExists = await checkLoginIdExists(loginId);
  if (loginIdExists) {
    throw new Error('Login ID already exists');
  }

  // Validate email uniqueness
  const emailExists = await findUserByEmail(email);
  if (emailExists) {
    throw new Error('Email already exists');
  }

  // Validate role exists
  const role = await getRoleById(roleId);
  if (!role) {
    throw new Error('Invalid role');
  }

  // Validate login_id length (6-12 characters)
  if (loginId.length < 6 || loginId.length > 12) {
    throw new Error('Login ID must be between 6-12 characters');
  }

  // Validate password strength
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  if (!passwordRegex.test(password)) {
    throw new Error('Password must contain at least one lowercase letter, one uppercase letter, one special character, and be at least 8 characters long');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const newUser = await createUser(name, loginId, email, hashedPassword, roleId);

  // If contact data provided, create contact record
  if (contactData) {
    await createContact({
      ...contactData,
      hasLoginAccess: true,
      userId: newUser.id,
      name : newUser.name
    });
  }

  return newUser;
};

/**
 * User signup (creates invoicing_user role by default)
 */
export const userSignup = async (name, loginId, email, password) => {
  // Validate login_id uniqueness
  const loginIdExists = await checkLoginIdExists(loginId);
  if (loginIdExists) {
    throw new Error('Login ID already exists');
  }

  // Validate email uniqueness
  const emailExists = await findUserByEmail(email);
  if (emailExists) {
    throw new Error('Email already exists');
  }

  // Validate login_id length (6-12 characters)
  if (loginId.length < 6 || loginId.length > 12) {
    throw new Error('Login ID must be between 6-12 characters');
  }

  // Validate password strength
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  if (!passwordRegex.test(password)) {
    throw new Error('Password must contain at least one lowercase letter, one uppercase letter, one special character, and be at least 8 characters long');
  }

  // Get invoicing_user role
  const invoicingUserRole = await getRoleById(3); // Assuming invoicing_user is role ID 3
  if (!invoicingUserRole) {
    throw new Error('Invoicing user role not found');
  }

  // Generate OTP for email verification
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

  // Store OTP with user data
  await upsertOtp({
    userId: null,
    name,
    email,
    loginId,
    type: "register",
    password: await bcrypt.hash(password, 10),
    roleId: invoicingUserRole.id,
    otp,
    otpExpires,
  });

  return { otp, email };
};

/**
 * Login user by login_id or email
 */
export const loginUser = async (loginIdentifier, password) => {
  // Try to find user by login_id first, then by email
  let user = await findUserByLoginId(loginIdentifier);
  if (!user) {
    user = await findUserByEmail(loginIdentifier);
  }

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Compare password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Generate token with role information
  const token = signToken({ 
    id: user.id, 
    role: user.role_name,
    permissions: user.permissions 
  });

  return { token, user };
};

/**
 * Verify OTP and create user
 */
export const verifyOtpAndCreateUser = async (email, otp) => {
  const otpRecord = await findOtpByEmail(email, "register");
  
  if (!otpRecord) {
    throw new Error("OTP not found or expired");
  }

  if (otpRecord.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  if (new Date(otpRecord.otp_expires) < new Date()) {
    throw new Error("OTP expired");
  }

  // Create user
  const newUser = await createUser(
    otpRecord.name,
    otpRecord.login_id,
    otpRecord.email,
    otpRecord.password,
    otpRecord.role_id
  );

  // Create contact record for the user
  await createContact({
    name: otpRecord.name,
    email: otpRecord.email,
    contactType: 'customer', // Default to customer for signup users
    hasLoginAccess: true,
    userId: newUser.id
  });

  // Generate token
  const token = signToken({ 
    id: newUser.id, 
    role: 'invoicing_user',
    permissions: otpRecord.permissions 
  });

  // Delete OTP after successful verification
  await deleteOtpByEmail(email, "register");

  return { token, user: newUser };
};

/**
 * Get all users (admin only)
 */
export const getAllUsersWithRoles = async () => {
  return await getAllUsers();
};

/**
 * Get all roles
 */
export const getAllAvailableRoles = async () => {
  return await getAllRoles();
};
