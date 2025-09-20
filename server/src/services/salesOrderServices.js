import pool from "../config/db.js";

/**
 * Create Sales Order
 */
export const createSalesOrder = async (orderData, items) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Insert into sales_orders
    const orderQuery = `
      INSERT INTO sales_orders (customer_id, order_date, subtotal, tax, grand_total)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const orderValues = [
      orderData.customer_id,
      orderData.order_date || new Date(),
      orderData.subtotal || 0,
      orderData.tax || 0,
      orderData.grand_total || 0
    ];
    const { rows: orderRows } = await client.query(orderQuery, orderValues);
    const salesOrder = orderRows[0];

    // Insert items
    const itemQuery = `
      INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const insertedItems = [];
    for (let item of items) {
      const itemValues = [
        salesOrder.id,
        item.product_id,
        item.quantity,
        item.unit_price
      ];
      const { rows } = await client.query(itemQuery, itemValues);
      insertedItems.push(rows[0]);
    }

    await client.query("COMMIT");
    return { ...salesOrder, items: insertedItems };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Confirm Sales Order (DRAFT -> CONFIRMED)
 */
export const confirmSalesOrder = async (soId) => {
  const query = `
    UPDATE sales_orders
    SET status = 'CONFIRMED', updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND status = 'DRAFT'
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [soId]);
  if (!rows[0]) throw new Error("Sales Order not found or not in DRAFT state");
  return rows[0];
};

/**
 * Generate Customer Invoice (CONFIRMED -> INVOICED)
 * Updates Inventory (-) and CoA
 */
export const generateCustomerInvoice = async (soId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Get SO + items
    const { rows: soRows } = await client.query(
      "SELECT * FROM sales_orders WHERE id = $1 AND status = 'CONFIRMED'",
      [soId]
    );
    if (!soRows[0]) throw new Error("Sales Order not found or not CONFIRMED");
    const salesOrder = soRows[0];

    const { rows: items } = await client.query(
      "SELECT * FROM sales_order_items WHERE sales_order_id = $1",
      [soId]
    );

    // 2. Insert into customer_invoices
    const invoiceQuery = `
      INSERT INTO customer_invoices (sales_order_id, invoice_date, subtotal, tax, grand_total, status)
      VALUES ($1, $2, $3, $4, $5, 'INVOICED') RETURNING *;
    `;
    const invoiceValues = [
      soId,
      new Date(),
      salesOrder.subtotal,
      salesOrder.tax,
      salesOrder.grand_total
    ];
    const { rows: invoiceRows } = await client.query(invoiceQuery, invoiceValues);
    const invoice = invoiceRows[0];

    // 3. Insert invoice items
    const invoiceItemQuery = `
      INSERT INTO customer_invoice_items (invoice_id, product_id, quantity, unit_price)
      VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const insertedInvoiceItems = [];
    for (let item of items) {
      const itemValues = [
        invoice.id,
        item.product_id,
        item.quantity,
        item.unit_price
      ];
      const { rows } = await client.query(invoiceItemQuery, itemValues);
      insertedInvoiceItems.push(rows[0]);

      // 4. Update inventory (-)
      await client.query(
        `UPDATE inventory SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE product_id = $2`,
        [item.quantity, item.product_id]
      );
    }

    // 5. Update CoA (simplified: Debit Accounts Receivable, Credit Sales Income)
    await client.query(
      `
      INSERT INTO transactions (coa_id, amount, type, reference_id, reference_type)
      VALUES 
        ((SELECT id FROM chart_of_accounts WHERE name = 'Accounts Receivable'), $1, 'DEBIT', $2, 'CUSTOMER_INVOICE'),
        ((SELECT id FROM chart_of_accounts WHERE name = 'Sales Income'), $1, 'CREDIT', $2, 'CUSTOMER_INVOICE')
      `,
      [invoice.grand_total, invoice.id]
    );

    // 6. Update SO status -> INVOICED
    await client.query(
      "UPDATE sales_orders SET status = 'INVOICED', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [soId]
    );

    await client.query("COMMIT");
    return { invoice, items: insertedInvoiceItems };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
