import pool from "../config/db.js";

export const createSampleVendors = async () => {
  try {
    // Check if vendors already exist
    const existingVendors = await pool.query(
      "SELECT COUNT(*) FROM contacts WHERE contact_type = 'vendor'"
    );
    
    if (parseInt(existingVendors.rows[0].count) > 0) {
      console.log("✅ Sample vendors already exist");
      return;
    }

    // Insert sample vendors
    const sampleVendors = [
      {
        name: "Azure Interior",
        email: "contact@azureinterior.com",
        phone: "+1-555-0101",
        company: "Azure Interior Solutions",
        address: "123 Design Street, New York, NY 10001",
        contact_type: "vendor",
        has_login_access: false,
        notes: "Premium furniture supplier"
      },
      {
        name: "Wooden World",
        email: "sales@woodenworld.com",
        phone: "+1-555-0102",
        company: "Wooden World Furniture",
        address: "456 Craft Avenue, Los Angeles, CA 90210",
        contact_type: "vendor",
        has_login_access: false,
        notes: "Handcrafted wooden furniture"
      },
      {
        name: "Modern Office Supplies",
        email: "orders@modernoffice.com",
        phone: "+1-555-0103",
        company: "Modern Office Solutions",
        address: "789 Business Blvd, Chicago, IL 60601",
        contact_type: "vendor",
        has_login_access: false,
        notes: "Office furniture and supplies"
      },
      {
        name: "Tech Equipment Co",
        email: "sales@techequipment.com",
        phone: "+1-555-0104",
        company: "Tech Equipment Corporation",
        address: "321 Innovation Drive, San Francisco, CA 94105",
        contact_type: "vendor",
        has_login_access: false,
        notes: "Technology and electronics supplier"
      }
    ];

    for (const vendor of sampleVendors) {
      await pool.query(
        `INSERT INTO contacts (name, email, phone, company, address, contact_type, has_login_access, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          vendor.name,
          vendor.email,
          vendor.phone,
          vendor.company,
          vendor.address,
          vendor.contact_type,
          vendor.has_login_access,
          vendor.notes
        ]
      );
    }

    console.log("✅ Sample vendors created successfully");
  } catch (error) {
    console.error("❌ Error creating sample vendors:", error.message);
  }
};
