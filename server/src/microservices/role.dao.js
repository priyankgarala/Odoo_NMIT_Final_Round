import pool from "../config/db.js";

// ------------------- Role Queries -------------------

/**
 * Get all active roles
 */
export const getAllRoles = async () => {
  const result = await pool.query("SELECT * FROM roles WHERE is_active = true ORDER BY name");
  return result.rows;
};

/**
 * Get role by ID
 */
export const getRoleById = async (id) => {
  const result = await pool.query("SELECT * FROM roles WHERE id = $1 AND is_active = true", [id]);
  return result.rows[0];
};

/**
 * Get role by name
 */
export const getRoleByName = async (name) => {
  const result = await pool.query("SELECT * FROM roles WHERE name = $1 AND is_active = true", [name]);
  return result.rows[0];
};

/**
 * Create a new role
 */
export const createRole = async (name, description, permissions) => {
  const result = await pool.query(
    `INSERT INTO roles (name, description, permissions)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, description, JSON.stringify(permissions)]
  );
  return result.rows[0];
};

/**
 * Update role permissions
 */
export const updateRolePermissions = async (id, permissions) => {
  const result = await pool.query(
    `UPDATE roles 
     SET permissions = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND is_active = true
     RETURNING *`,
    [id, JSON.stringify(permissions)]
  );
  return result.rows[0];
};

/**
 * Deactivate a role
 */
export const deactivateRole = async (id) => {
  const result = await pool.query(
    `UPDATE roles 
     SET is_active = false, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return result.rows[0];
};
