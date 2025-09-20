import { findUserByEmail, createUser, upsertOtp, findOtpByEmail, deleteOtpByEmail, updateUserPasswordByEmail } from "../microservices/user.dao.js";
import { signToken } from "../utils/helper.js";
import crypto from 'crypto'
import { sendMail } from "../utils/mailer.js";
import bcrypt from 'bcrypt';


export const registerUser = async(name,email,password) => {
    const existingUser = await findUserByEmail(email);
    if(existingUser){
      throw Error('User already exists');
    }
    // Generate a 6-digit OTP valid for 5 minutes
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    // Store or update OTP record for this email and type
    await upsertOtp({
      userId: null,
      name,
      email,
      type: "register",
      password: await bcrypt.hash(password, 10),
      otp,
      otpExpires,
    });
    
    return {otp, email};
}

export const loginUser = async(email,password) => {
    // Fetch user from Postgres
    const user = await findUserByEmail(email);
    if(!user){
        throw new Error('Invalid credentials');
    }

    // Compare password using bcrypt when hash-like, else fallback to plain compare
    const storedPassword = user.password || '';
    let isPasswordValid = false;
    if(typeof storedPassword === 'string' && storedPassword.startsWith('$2')){
        isPasswordValid = await bcrypt.compare(password, storedPassword);
    } else {
        isPasswordValid = storedPassword === password;
    }

    if(!isPasswordValid){
        throw new Error('Invalid Email or Password');
    }

    const token = signToken({id : user.id});
    return {token, user};
}

export const forgot_password = async (email) => {
  const user = await findUserByEmail(email);
  if(!user){
    return { success: false, message: "User not found" };
  }
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

  await upsertOtp({
    userId: user.id,
    name: user.name,
    email: user.email,
    type: "reset",
    password: null,
    otp,
    otpExpires,
  });

  await sendMail( user.email, "Password Reset OTP",`Your OTP for resetting password is: ${otp}`);

  return { success: true, message: "OTP sent to email" };
};

export const reset_password = async (email, otp, newPassword) => {
  const otpRecord = await findOtpByEmail(email, "reset");
  if(!otpRecord){
    return { success: false, message: "No OTP found, request again" };
  }
  if(otpRecord.otp !== otp){
    return { success: false, message: "Invalid OTP" };
  }
  if(new Date(otpRecord.otp_expires) < new Date()){
    return { success: false, message: "OTP expired" };
  }

  const user = await findUserByEmail(email);
  if (!user){
    return { success: false, message: "User not found" };
  }

  const passwordHash = (typeof user.password === 'string' && user.password.startsWith('$2'))
    ? await bcrypt.hash(newPassword, 10) // re-hash even if already hashed to rotate
    : await bcrypt.hash(newPassword, 10);

  await updateUserPasswordByEmail(email, passwordHash);

  // Delete OTP record after success
  await deleteOtpByEmail(email, "reset");

  return { success: true, message: "Password reset successful" };
};


export const verify_Otp = async (email, otp, type = 'register') => {
  // Retrieve OTP record
  const otpRecord = await findOtpByEmail(email,type);

  if (!otpRecord) {
    throw Error("OTP not found or expired");
  }

  // Validate OTP value
  if (otpRecord.otp !== otp) {
    throw Error("Invalid OTP");
  }

  // Validate OTP expiry
  if (new Date(otpRecord.otp_expires) < new Date()) {
    throw Error("OTP expired");
  }

  if(type === "register"){
    const name = otpRecord.name;
    const newUserEmail = otpRecord.email;
    const password = otpRecord.password;
    
    // Create user in users table
    const newUser = await createUser(name, newUserEmail, password);
    
    // Sign JWT token
    const token = signToken({ id: newUser.id });
    
    // Delete OTP after successful verification
    await deleteOtpByEmail(email,type);
    
    return { token, user: newUser };
  }
};