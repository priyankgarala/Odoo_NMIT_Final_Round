import pool from "../config/db.js";

const mapRowToProductTax = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    product_id: row.product_id,
    tax_id: row.tax_id,
    applicable_on: row.applicable_on,
  };
};

export const createProductTax = async (productTaxData) => {
  const { product_id, tax_id, applicable_on } = productTaxData;

  const query = {
    text: "INSERT INTO product_taxes (product_id, tax_id, applicable_on) VALUES ($1, $2, $3) RETURNING *",
    values: [product_id, tax_id, applicable_on],
  };
  
  const { rows } = await pool.query(query);
  return mapRowToProductTax(rows[0]);
};

export const findProductTaxesByProductId = async (productId) => {
  const query = {
    text: `
      SELECT pt.*, t.name as tax_name, t.computation_method, t.value as tax_value, t.description as tax_description
      FROM product_taxes pt
      JOIN taxes t ON pt.tax_id = t.id
      WHERE pt.product_id = $1 AND t.is_active = true
      ORDER BY pt.applicable_on, t.name
    `,
    values: [productId],
  };
  
  const { rows } = await pool.query(query);
  return rows.map(row => ({
    id: row.id,
    product_id: row.product_id,
    tax_id: row.tax_id,
    applicable_on: row.applicable_on,
    tax_name: row.tax_name,
    computation_method: row.computation_method,
    tax_value: Number(row.tax_value),
    tax_description: row.tax_description,
  }));
};

export const findProductTaxesByTaxId = async (taxId) => {
  const query = {
    text: `
      SELECT pt.*, p.name as product_name
      FROM product_taxes pt
      JOIN products p ON pt.product_id = p.id
      WHERE pt.tax_id = $1 AND p.is_active = true
      ORDER BY p.name
    `,
    values: [taxId],
  };
  
  const { rows } = await pool.query(query);
  return rows.map(row => ({
    id: row.id,
    product_id: row.product_id,
    tax_id: row.tax_id,
    applicable_on: row.applicable_on,
    product_name: row.product_name,
  }));
};

export const deleteProductTax = async (productId, taxId, applicableOn) => {
  const query = {
    text: "DELETE FROM product_taxes WHERE product_id = $1 AND tax_id = $2 AND applicable_on = $3",
    values: [productId, taxId, applicableOn],
  };
  
  await pool.query(query);
  return true;
};

export const deleteAllProductTaxesByProductId = async (productId) => {
  await pool.query("DELETE FROM product_taxes WHERE product_id = $1", [productId]);
  return true;
};

export const deleteAllProductTaxesByTaxId = async (taxId) => {
  await pool.query("DELETE FROM product_taxes WHERE tax_id = $1", [taxId]);
  return true;
};

export const updateProductTaxes = async (productId, taxData) => {
  console.log("Updating product taxes:", productId, taxData); // Debug log
  
  // First, remove all existing tax relationships for this product
  await deleteAllProductTaxesByProductId(productId);
  
  // Then add the new tax relationships
  if (taxData && taxData.length > 0) {
    for (const tax of taxData) {
      console.log("Creating product tax relationship:", {
        product_id: productId,
        tax_id: tax.tax_id,
        applicable_on: tax.applicable_on,
      }); // Debug log
      
      await createProductTax({
        product_id: productId,
        tax_id: tax.tax_id,
        applicable_on: tax.applicable_on,
      });
    }
  }
  
  return true;
};
