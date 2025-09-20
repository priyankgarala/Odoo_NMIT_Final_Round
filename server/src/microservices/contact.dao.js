import pool from "../config/db.js";

// ------------------- Contact Queries -------------------

/**
 * Get all contacts with optional filtering
 */
export const getAllContacts = async (contactType = null, hasLoginAccess = null) => {
  let query = "SELECT c.*, u.login_id, u.email as user_email FROM contacts c LEFT JOIN users u ON c.user_id = u.id WHERE c.is_active = true";
  const params = [];
  let paramCount = 0;

  if (contactType) {
    paramCount++;
    query += ` AND c.contact_type = $${paramCount}`;
    params.push(contactType);
  }

  if (hasLoginAccess !== null) {
    paramCount++;
    query += ` AND c.has_login_access = $${paramCount}`;
    params.push(hasLoginAccess);
  }

  query += " ORDER BY c.name";

  const result = await pool.query(query, params);
  return result.rows;
};

/**
 * Get contact by ID
 */
export const getContactById = async (id) => {
  const result = await pool.query(
    `SELECT c.*, u.login_id, u.email as user_email 
     FROM contacts c 
     LEFT JOIN users u ON c.user_id = u.id 
     WHERE c.id = $1 AND c.is_active = true`,
    [id]
  );
  return result.rows[0];
};

/**
 * Get contact by user ID
 */
export const getContactByUserId = async (userId) => {
  const result = await pool.query(
    "SELECT * FROM contacts WHERE user_id = $1 AND is_active = true",
    [userId]
  );
  return result.rows[0];
};

/**
 * Create a new contact
 */
export const createContact = async (contactData) => {
  const {
    name,
    email,
    phone,
    company,
    address,
    contactType,
    hasLoginAccess = false,
    userId = null,
    notes
  } = contactData;

  const result = await pool.query(
    `INSERT INTO contacts (name, email, phone, company, address, contact_type, has_login_access, user_id, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [name, email, phone, company, address, contactType, hasLoginAccess, userId, notes]
  );
  return result.rows[0];
};

/**
 * Update contact
 */
export const updateContact = async (id, contactData) => {
  const {
    name,
    email,
    phone,
    company,
    address,
    contactType,
    hasLoginAccess,
    userId,
    notes
  } = contactData;

  const result = await pool.query(
    `UPDATE contacts 
     SET name = COALESCE($2, name),
         email = COALESCE($3, email),
         phone = COALESCE($4, phone),
         company = COALESCE($5, company),
         address = COALESCE($6, address),
         contact_type = COALESCE($7, contact_type),
         has_login_access = COALESCE($8, has_login_access),
         user_id = COALESCE($9, user_id),
         notes = COALESCE($10, notes),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND is_active = true
     RETURNING *`,
    [id, name, email, phone, company, address, contactType, hasLoginAccess, userId, notes]
  );
  return result.rows[0];
};

/**
 * Deactivate contact
 */
export const deactivateContact = async (id) => {
  const result = await pool.query(
    `UPDATE contacts 
     SET is_active = false, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return result.rows[0];
};

/**
 * Delete contact (soft delete)
 */
export const deleteContact = async (id) => {
  const result = await pool.query(
    `UPDATE contacts 
     SET is_active = false, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return result.rows[0];
};

/**
 * Link contact to user (when granting login access)
 */
export const linkContactToUser = async (contactId, userId) => {
  const result = await pool.query(
    `UPDATE contacts 
     SET user_id = $2, has_login_access = true, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND is_active = true
     RETURNING *`,
    [contactId, userId]
  );
  return result.rows[0];
};
