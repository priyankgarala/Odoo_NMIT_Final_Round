import pool from "../config/db.js";

export const createPurchaseOrder = async (orderData, items) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Insert into purchase_orders
    const orderQuery = `
      INSERT INTO purchase_orders (vendor_id, order_date, status, total_amount, tax_amount, grand_total, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const orderValues = [
      orderData.vendor_id,
      orderData.order_date || new Date(),
      "DRAFT", // default status
      orderData.total_amount || 0,
      orderData.tax_amount || 0,
      orderData.grand_total || 0,
      orderData.created_by || null,
    ];

    const { rows: orderRows } = await client.query(orderQuery, orderValues);
    const purchaseOrder = orderRows[0];

    // Insert items
    const itemQuery = `
      INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, tax_rate, tax_amount, line_total)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const insertedItems = [];
    for (let item of items) {
      const itemValues = [
        purchaseOrder.id,
        item.product_id,
        item.quantity,
        item.unit_price,
        item.tax_rate || 0,
        item.tax_amount || 0,
        item.line_total,
      ];
      const { rows } = await client.query(itemQuery, itemValues);
      insertedItems.push(rows[0]);
    }

    await client.query("COMMIT");

    return { ...purchaseOrder, items: insertedItems };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};


/**
 * Confirm PO (DRAFT -> CONFIRMED)
 */
export const confirmPurchaseOrder = async (poId) => {
  const query = `
    UPDATE purchase_orders
    SET status = 'CONFIRMED', updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND status = 'DRAFT'
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [poId]);
  if (rows.length === 0) {
    throw new Error("Purchase Order not found or not in DRAFT state");
  }
  return rows[0];
};


/**
 * Bill PO (CONFIRMED -> BILLED) => Update inventory + CoA
 */
export const billPurchaseOrder = async (poId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Get PO + Items
    const { rows: poRows } = await client.query(
      "SELECT * FROM purchase_orders WHERE id = $1 AND status = 'CONFIRMED'",
      [poId]
    );
    if (poRows.length === 0) {
      throw new Error("Purchase Order not found or not in CONFIRMED state");
    }
    const purchaseOrder = poRows[0];

    const { rows: items } = await client.query(
      "SELECT * FROM purchase_order_items WHERE purchase_order_id = $1",
      [poId]
    );

    // 2. Update inventory for each product
    for (let item of items) {
      await client.query(
        `
        INSERT INTO inventory (product_id, quantity)
        VALUES ($1, $2)
        ON CONFLICT (product_id)
        DO UPDATE SET quantity = inventory.quantity + EXCLUDED.quantity,
                      updated_at = CURRENT_TIMESTAMP
        `,
        [item.product_id, item.quantity]
      );
    }

    // 3. Record journal entry in CoA (simplified double-entry)
    // Purchases Expense (Debit), Accounts Payable (Credit), GST Input (Debit if applicable)
    await client.query(
      `
      INSERT INTO transactions (coa_id, amount, type, reference_id, reference_type)
      VALUES 
        ((SELECT id FROM chart_of_accounts WHERE name = 'Purchases Expense'), $1, 'DEBIT', $2, 'PURCHASE_ORDER'),
        ((SELECT id FROM chart_of_accounts WHERE name = 'Accounts Payable'), $1, 'CREDIT', $2, 'PURCHASE_ORDER')
      `,
      [purchaseOrder.grand_total, poId]
    );

    // 4. Update PO status -> BILLED
    const { rows: updatedPo } = await client.query(
      "UPDATE purchase_orders SET status = 'BILLED', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [poId]
    );

    await client.query("COMMIT");
    return { ...updatedPo[0], items };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};