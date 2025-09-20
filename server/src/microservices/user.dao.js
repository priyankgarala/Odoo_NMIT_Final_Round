import pool from "../config/db.js";

// ------------------- User Queries -------------------

/**
 * Returns the first user that matches the provided email.
 */
export const findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT u.*, r.name as role_name, r.permissions 
     FROM users u 
     LEFT JOIN roles r ON u.role_id = r.id 
     WHERE u.email = $1 AND u.is_active = true`,
    [email]
  );
  return result.rows[0];
};

/**
 * Returns the first user that matches the provided login_id.
 */
export const findUserByLoginId = async (loginId) => {
  const result = await pool.query(
    `SELECT u.*, r.name as role_name, r.permissions 
     FROM users u 
     LEFT JOIN roles r ON u.role_id = r.id 
     WHERE u.login_id = $1 AND u.is_active = true`,
    [loginId]
  );
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
  console.log("Finding user with ID:", id);
  const result = await pool.query(
    `SELECT u.*, r.name as role_name, r.permissions 
     FROM users u 
     LEFT JOIN roles r ON u.role_id = r.id 
     WHERE u.id = $1 AND u.is_active = true`,
    [id]
  );
  console.log("DB result:", result.rows);
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
export const createUser = async (name, loginId, email, password, roleId = null) => {
  const result = await pool.query(
    `INSERT INTO users (name, login_id, email, password, role_id, is_verified)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, loginId, email, password, roleId, true]
  );
  return result.rows[0];
};

/**
 * Get all users with their roles
 */
export const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT u.*, r.name as role_name, r.permissions 
     FROM users u 
     LEFT JOIN roles r ON u.role_id = r.id 
     WHERE u.is_active = true
     ORDER BY u.name`
  );
  return result.rows;
};

/**
 * Check if login_id already exists
 */
export const checkLoginIdExists = async (loginId) => {
  const result = await pool.query("SELECT id FROM users WHERE login_id = $1", [loginId]);
  return result.rows.length > 0;
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
export const upsertOtp = async ({ userId = null, name = null, email, loginId = null, type, password = null, roleId = null, otp, otpExpires }) => {
  await pool.query(
    `INSERT INTO otps (user_id, name, email, login_id, type, password, role_id, otp, otp_expires)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (email,type) 
     DO UPDATE SET user_id = EXCLUDED.user_id, name = EXCLUDED.name, login_id = EXCLUDED.login_id, password = EXCLUDED.password, role_id = EXCLUDED.role_id, otp = EXCLUDED.otp, otp_expires = EXCLUDED.otp_expires`,
    [userId, name, email, loginId, type, password, roleId, otp, otpExpires]
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