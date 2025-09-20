import pool from "../config/db.js";

const mapRowToTax = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    computation_method: row.computation_method,
    value: Number(row.value),
    applicable_on: row.applicable_on,
    description: row.description,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

export const createTax = async (taxData) => {
  const {
    name,
    computation_method,
    value,
    applicable_on,
    description = null,
    is_active = true,
  } = taxData;

  const query = {
    text: "INSERT INTO taxes (name, computation_method, value, applicable_on, description, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    values: [name, computation_method, value, applicable_on, description, is_active],
  };
  
  const { rows } = await pool.query(query);
  return mapRowToTax(rows[0]);
};

export const findAllTaxes = async () => {
  const { rows } = await pool.query(
    "SELECT * FROM taxes WHERE is_active = true ORDER BY created_at DESC"
  );
  return rows.map(mapRowToTax);
};

export const findTaxById = async (taxId) => {
  const { rows } = await pool.query(
    "SELECT * FROM taxes WHERE id = $1",
    [taxId]
  );
  return mapRowToTax(rows[0]);
};

export const findTaxesByApplicableOn = async (applicableOn) => {
  const { rows } = await pool.query(
    "SELECT * FROM taxes WHERE applicable_on IN ($1, 'both') AND is_active = true ORDER BY created_at DESC",
    [applicableOn]
  );
  return rows.map(mapRowToTax);
};

export const updateTaxById = async (taxId, updateData) => {
  const allowedFields = [
    "name",
    "computation_method", 
    "value",
    "applicable_on",
    "description",
    "is_active",
  ];

  const fields = Object.keys(updateData).filter((k) =>
    allowedFields.includes(k)
  );
  
  if (fields.length === 0) {
    const { rows } = await pool.query(
      "SELECT * FROM taxes WHERE id = $1",
      [taxId]
    );
    return mapRowToTax(rows[0]);
  }

  const setFragments = fields.map((field, idx) => `${field} = $${idx + 1}`);
  const values = fields.map((field) => updateData[field]);
  values.push(taxId);

  const query = {
    text: `UPDATE taxes SET ${setFragments.join(", ")}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
    values,
  };
  
  const { rows } = await pool.query(query);
  return mapRowToTax(rows[0]);
};

export const deleteTaxById = async (taxId) => {
  // First, remove all product-tax relationships
  await pool.query("DELETE FROM product_taxes WHERE tax_id = $1", [taxId]);
  
  // Then delete the tax
  await pool.query("DELETE FROM taxes WHERE id = $1", [taxId]);
  return true;
};

export const softDeleteTaxById = async (taxId) => {
  // Soft delete by setting is_active to false
  const query = {
    text: "UPDATE taxes SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *",
    values: [taxId],
  };
  
  const { rows } = await pool.query(query);
  return mapRowToTax(rows[0]);
};
