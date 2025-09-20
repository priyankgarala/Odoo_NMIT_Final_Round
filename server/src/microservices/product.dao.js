import pool from "../config/db.js";
import { calculateProductTaxes } from "../utils/taxCalculator.js";

const mapRowToProduct = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    sales_price: Number(row.sales_price),
    purchase_price: Number(row.purchase_price),
    sales_account_id: row.sales_account_id,
    purchase_account_id: row.purchase_account_id,
    hsn_code: row.hsn_code,
    category: row.category,
    created_by: row.created_by,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

export const createProduct = async (productData) => {
  const {
    name,
    type,
    sales_price = 0.00,
    purchase_price = 0.00,
    sales_account_id = null,
    purchase_account_id = null,
    hsn_code = null,
    category = null,
    created_by = null,
    is_active = true,
  } = productData;

  // Get default account IDs if not provided
  let finalSalesAccountId = sales_account_id;
  let finalPurchaseAccountId = purchase_account_id;

  if (!sales_account_id || !purchase_account_id) {
    try {
      const defaultAccounts = await getDefaultAccountIds();
      finalSalesAccountId = sales_account_id || defaultAccounts.sales_account_id;
      finalPurchaseAccountId = purchase_account_id || defaultAccounts.purchase_account_id;
    } catch (error) {
      console.warn("Warning: Could not get default account IDs, using provided values or null:", error.message);
    }
  }

  const query = {
    text:
      "INSERT INTO products (name, type, sales_price, purchase_price, sales_account_id, purchase_account_id, hsn_code, category, created_by, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
    values: [
      name,
      type,
      sales_price,
      purchase_price,
      finalSalesAccountId,
      finalPurchaseAccountId,
      hsn_code,
      category,
      created_by,
      is_active,
    ],
  };
  const { rows } = await pool.query(query);
  return mapRowToProduct(rows[0]);
};

export const findProductsByUser = async (userId) => {
  const { rows } = await pool.query(
    "SELECT * FROM products WHERE created_by = $1 AND is_active = true ORDER BY created_at DESC",
    [userId]
  );
  return rows.map(mapRowToProduct);
};

export const findAllActiveProducts = async () => {
  const { rows } = await pool.query(
    "SELECT * FROM products WHERE is_active = true ORDER BY created_at DESC"
  );
  return rows.map(mapRowToProduct);
};

export const findProductById = async (productId) => {
  const { rows } = await pool.query(
    "SELECT * FROM products WHERE id = $1",
    [productId]
  );
  return mapRowToProduct(rows[0]);
};

export const updateProductById = async (productId, updateData) => {
  const allowedFields = [
    "name",
    "type",
    "sales_price",
    "purchase_price",
    "sales_account_id",
    "purchase_account_id",
    "hsn_code",
    "category",
    "is_active",
  ];

  const fields = Object.keys(updateData).filter((k) =>
    allowedFields.includes(k)
  );
  if (fields.length === 0) {
    const { rows } = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [productId]
    );
    return mapRowToProduct(rows[0]);
  }

  const setFragments = fields.map((field, idx) => `${field} = $${idx + 1}`);
  const values = fields.map((field) => updateData[field]);
  values.push(productId);

  const query = {
    text: `UPDATE products SET ${setFragments.join(", ")}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
    values,
  };
  const { rows } = await pool.query(query);
  return mapRowToProduct(rows[0]);
};

export const findProductWithTaxes = async (productId) => {
  const query = {
    text: `
      SELECT p.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', pt.id,
                   'tax_id', pt.tax_id,
                   'applicable_on', pt.applicable_on,
                   'tax_name', t.name,
                   'computation_method', t.computation_method,
                   'tax_value', t.value,
                   'tax_description', t.description
                 )
               ) FILTER (WHERE pt.id IS NOT NULL), 
               '[]'::json
             ) as taxes
      FROM products p
      LEFT JOIN product_taxes pt ON p.id = pt.product_id
      LEFT JOIN taxes t ON pt.tax_id = t.id AND t.is_active = true
      WHERE p.id = $1
      GROUP BY p.id
    `,
    values: [productId],
  };
  
  const { rows } = await pool.query(query);
  if (rows.length === 0) return null;
  
  const product = mapRowToProduct(rows[0]);
  product.taxes = rows[0].taxes;
  
  // Add calculated tax amounts
  const taxCalculation = calculateProductTaxes(product);
  product.tax_calculation = taxCalculation;
  
  return product;
};

export const deleteProductById = async (productId) => {
  // First delete all product-tax relationships
  await pool.query("DELETE FROM product_taxes WHERE product_id = $1", [productId]);
  
  // Then delete the product
  await pool.query("DELETE FROM products WHERE id = $1", [productId]);
  return true;
};


