import pool from "../config/db.js";

export const createSampleTaxes = async () => {
  try {
    // Check if taxes already exist
    const { rows } = await pool.query("SELECT COUNT(*) FROM taxes");
    const count = parseInt(rows[0].count);
    
    if (count > 0) {
      console.log("Taxes already exist, skipping sample creation");
      return;
    }

    // Create sample taxes
    const sampleTaxes = [
      {
        name: "GST 5%",
        computation_method: "percentage",
        value: 5.00,
        applicable_on: "both",
        description: "Goods and Services Tax 5%"
      },
      {
        name: "GST 12%",
        computation_method: "percentage", 
        value: 12.00,
        applicable_on: "both",
        description: "Goods and Services Tax 12%"
      },
      {
        name: "GST 18%",
        computation_method: "percentage",
        value: 18.00,
        applicable_on: "both", 
        description: "Goods and Services Tax 18%"
      },
      {
        name: "GST 28%",
        computation_method: "percentage",
        value: 28.00,
        applicable_on: "both",
        description: "Goods and Services Tax 28%"
      },
      {
        name: "Service Tax 10%",
        computation_method: "percentage",
        value: 10.00,
        applicable_on: "sales",
        description: "Service Tax for sales only"
      },
      {
        name: "Fixed Tax ₹100",
        computation_method: "fixed",
        value: 100.00,
        applicable_on: "purchase",
        description: "Fixed tax amount for purchase"
      }
    ];

    for (const tax of sampleTaxes) {
      await pool.query(
        "INSERT INTO taxes (name, computation_method, value, applicable_on, description) VALUES ($1, $2, $3, $4, $5)",
        [tax.name, tax.computation_method, tax.value, tax.applicable_on, tax.description]
      );
    }

    console.log("Sample taxes created successfully");
  } catch (error) {
    console.error("Error creating sample taxes:", error);
  }
};
