import pool from "../config/db.js";
import bcrypt from 'bcrypt';

/**
 * Script to create the initial admin user
 * Run this script once to set up the first admin user
 */
async function createAdminUser() {
  try {
    // First, ensure roles exist
    const rolesResult = await pool.query("SELECT id FROM roles WHERE name = 'admin'");
    if (rolesResult.rows.length === 0) {
      console.log("Creating admin role...");
      await pool.query(`
        INSERT INTO roles (name, description, permissions) 
        VALUES ('admin', 'Full system access', '{"users": {"create": true, "read": true, "update": true, "delete": true}, "products": {"create": true, "read": true, "update": true, "delete": true}, "contacts": {"create": true, "read": true, "update": true, "delete": true}}')
      `);
    }

    // Get admin role ID
    const adminRoleResult = await pool.query("SELECT id FROM roles WHERE name = 'admin'");
    const adminRoleId = adminRoleResult.rows[0].id;

    // Check if admin user already exists
    const existingAdmin = await pool.query("SELECT id FROM users WHERE login_id = 'admin'");
    if (existingAdmin.rows.length > 0) {
      console.log("Admin user already exists!");
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    const result = await pool.query(`
      INSERT INTO users (name, login_id, email, password, role_id, is_verified, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, login_id, email
    `, ['System Administrator', 'admin', 'admin@system.com', hashedPassword, adminRoleId, true, true]);

    const adminUser = result.rows[0];
    console.log("✅ Admin user created successfully!");
    console.log("Login ID: admin");
    console.log("Password: Admin123!");
    console.log("Email: admin@system.com");
    console.log("User ID:", adminUser.id);

  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
  } finally {
    await pool.end();
  }
}

// Run the script
createAdminUser();
