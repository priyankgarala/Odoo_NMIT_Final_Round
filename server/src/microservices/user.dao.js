import pool from "../config/db.js";

// ------------------- User Queries -------------------

/**
 * Returns the first user that matches the provided email.
 */
export const findUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0];
};

/**
 * Returns the first user that matches the provided email.
 * Note: password hashing/verification occurs at the service/model layer.
 */
export const findUserByEmailAndPassword = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0];
};

/**
 * Fetches a user by id.
 */
export const findUserById = async (id) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0];
};

/**
 * Updates profile fields and returns the updated user row.
 */
export const updateUserProfileById = async ({ id, name, email, bio, avatar }) => {
  const result = await pool.query(
    `UPDATE users
     SET name = COALESCE($2, name),
         email = COALESCE($3, email),
         bio = COALESCE($4, bio),
         avatar = COALESCE($5, avatar),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [id, name, email, bio, avatar]
  );
  return result.rows[0];
};

/**
 * Inserts a verified user. Used after OTP verification succeeds.
 */
export const createUser = async (name, email, password) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password, is_verified)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, email, password, true]
  );
  return result.rows[0];
};

/**
 * Updates a user's password identified by email.
 */
export const updateUserPasswordByEmail = async (email, passwordHash) => {
  await pool.query(
    `UPDATE users SET password = $1 WHERE email = $2`,
    [passwordHash, email]
  );
};

// ------------------- OTP Queries -------------------

/**
 * Upserts an OTP for a given email and type, replacing existing values.
 */
export const upsertOtp = async ({ userId = null, name = null, email, type, password = null, otp, otpExpires }) => {
  await pool.query(
    `INSERT INTO otps (user_id, name, email, type, password, otp, otp_expires)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (email,type) 
     DO UPDATE SET user_id = EXCLUDED.user_id, name = EXCLUDED.name, password = EXCLUDED.password, otp = EXCLUDED.otp, otp_expires = EXCLUDED.otp_expires`,
    [userId, name, email,type,password, otp, otpExpires]
  );
};

/**
 * Retrieves the OTP record for an email and purpose type.
 */
export const findOtpByEmail = async (email,type) => {
  const result = await pool.query("SELECT * FROM otps WHERE email = $1 AND type = $2", [email, type]);
  return result.rows[0];
};

/**
 * Deletes the OTP record for an email and purpose type.
 */
export const deleteOtpByEmail = async (email,type) => {
  await pool.query("DELETE FROM otps WHERE email = $1 AND type = $2", [email,type]);
};