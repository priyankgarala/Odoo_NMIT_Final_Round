import { registerUser, loginUser, verify_Otp, reset_password, forgot_password } from "../services/authServices.js"
import { cookieOptions } from "../config/config.js";
import HttpError from "../utils/HttpError.js";
import {sendMail} from "../utils/mailer.js"; // your nodemailer setup

/**
 * Starts registration by generating an OTP and emailing it to the user.
 */
const register_user = async(req,res,next)=> {
    const {name, email, password} = req.body;
    try{
        const {otp, email : userEmail} = await registerUser(name,email,password);
        await sendMail(userEmail, "Your OTP Code", `Your OTP is: ${otp}`);
        res.status(200).json({message : "OTP Sent Successfully. Please verify to complete registration."});
    }
    catch(error){
        return next(HttpError.badRequest(error.message || "Registration failed"));
    }
}

/**
 * Logs in a user against PostgreSQL users table, sets auth cookie.
 */
const login_user = async(req,res,next)=> {
    const {email, password} = req.body;
    try{
        const {token, user} = await loginUser(email,password);
        req.user = user;
        res.cookie("accessToken", token, cookieOptions);
        res.status(200).json({message : "Login Success"}); 
    }
    catch(error){
        return next(HttpError.unauthorized(error.message || "Invalid Credentials"));
    }
};

const logout_user = async(req,res)=> {
    res.clearCookie("accessToken", cookieOptions);
    res.status(200).json({message: "Logout Successful"});
};

/**
 * Verifies registration OTP, sets auth cookie, and returns created user.
 */
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const {token, user} = await verify_Otp(email, otp, "register");
    req.user = user;
    res.cookie("accessToken", token, cookieOptions);
    res.status(200).json({ message: "User verified & registered successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const response = await forgot_password(email);
    res.json({ message : "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const response = await reset_password(email, otp, newPassword);
    res.json({ message : "Password set successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export default {
    register_user,
    login_user,
    logout_user,
    verifyOtp,
    resetPassword,
    forgotPassword
}