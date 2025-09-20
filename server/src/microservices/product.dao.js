import pool from "../config/db.js";

const mapRowToProduct = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    quantity: row.quantity,
    category: row.category,
    condition: row.condition,
    image_url: row.image_url,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

export const createProduct = async (productData) => {
  const {
    user_id,
    name,
    description = null,
    price,
    quantity = 1,
    category = null,
    condition = "new",
    image_url = null,
    is_active = true,
  } = productData;

  const query = {
    text:
      "INSERT INTO products (user_id, name, description, price, quantity, category, condition, image_url, is_active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
    values: [
      user_id,
      name,
      description,
      price,
      quantity,
      category,
      condition,
      image_url,
      is_active,
    ],
  };
  const { rows } = await pool.query(query);
  return mapRowToProduct(rows[0]);
};

export const findProductsByUser = async (userId) => {
  const { rows } = await pool.query(
    "SELECT * FROM products WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC",
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
    "description",
    "price",
    "quantity",
    "category",
    "condition",
    "image_url",
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

export const deleteProductById = async (productId) => {
  await pool.query("DELETE FROM products WHERE id = $1", [productId]);
  return true;
};


