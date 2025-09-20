import pool from "../config/db.js";

/**
 * Create Sales Order
 */
export const createSalesOrder = async (orderData, items, userId) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Insert into sales_orders
    const orderQuery = `
      INSERT INTO sales_orders (customer_id, order_date, status, total_amount, tax_amount, grand_total, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const orderValues = [
      orderData.customer_id,
      orderData.order_date || new Date(),
      orderData.status || 'DRAFT',
      orderData.total_amount || 0,
      orderData.tax_amount || 0,
      orderData.grand_total || 0,
      userId
    ];
    const { rows: orderRows } = await client.query(orderQuery, orderValues);
    const salesOrder = orderRows[0];

    // Insert items
    const itemQuery = `
      INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, tax_rate, tax_amount, line_total)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const insertedItems = [];
    for (let item of items) {
      const itemValues = [
        salesOrder.id,
        item.product_id,
        item.quantity,
        item.unit_price,
        item.tax_rate || 0,
        item.tax_amount || 0,
        item.line_total || (item.unit_price * item.quantity)
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
export const generateCustomerInvoice = async (soId, userId) => {
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

    // 2. Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`;

    // 3. Insert into customer_invoices
    const invoiceQuery = `
      INSERT INTO customer_invoices (invoice_number, customer_id, so_id, invoice_date, due_date, status, total_amount, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
    `;
    const invoiceValues = [
      invoiceNumber,
      salesOrder.customer_id,
      soId,
      new Date(),
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      'UNPAID',
      salesOrder.grand_total,
      userId
    ];
    const { rows: invoiceRows } = await client.query(invoiceQuery, invoiceValues);
    const invoice = invoiceRows[0];

    // 4. Insert invoice items
    const invoiceItemQuery = `
      INSERT INTO customer_invoice_items (customer_invoice_id, product_id, quantity, unit_price, tax_id)
      VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
    const insertedInvoiceItems = [];
    for (let item of items) {
      const itemValues = [
        invoice.id,
        item.product_id,
        item.quantity,
        item.unit_price,
        null // tax_id can be null for now
      ];
      const { rows } = await client.query(invoiceItemQuery, itemValues);
      insertedInvoiceItems.push(rows[0]);

      // 5. Update inventory (-)
      await client.query(
        `UPDATE inventory SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE product_id = $2`,
        [item.quantity, item.product_id]
      );
    }

    // 6. Insert into user_invoices table
    const userInvoiceQuery = `
      INSERT INTO user_invoices (user_id, customer_invoice_id, invoice_number, invoice_date, due_date, amount_due, payment_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
    `;
    const userInvoiceValues = [
      userId,
      invoice.id,
      invoice.invoice_number,
      invoice.invoice_date,
      invoice.due_date,
      invoice.total_amount,
      'UNPAID'
    ];
    const { rows: userInvoiceRows } = await client.query(userInvoiceQuery, userInvoiceValues);
    const userInvoice = userInvoiceRows[0];

    // 7. Update SO status -> INVOICED
    await client.query(
      "UPDATE sales_orders SET status = 'INVOICED', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [soId]
    );

    await client.query("COMMIT");
    return { invoice, items: insertedInvoiceItems, userInvoice };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get all customer invoices
 */
export const getAllCustomerInvoices = async () => {
  const query = `
    SELECT 
      ci.*,
      c.name as customer_name,
      c.email as customer_email,
      c.phone as customer_phone,
      so.id as sales_order_id,
      so.order_date as sales_order_date
    FROM customer_invoices ci
    LEFT JOIN contacts c ON ci.customer_id = c.id
    LEFT JOIN sales_orders so ON ci.so_id = so.id
    ORDER BY ci.created_at DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

/**
 * Get user invoice by ID (for payment page)
 */
export const getUserInvoiceById = async (invoiceId) => {
  const client = await pool.connect();
  try {
    // Get invoice details
    const invoiceQuery = `
      SELECT 
        ui.*,
        ci.invoice_number,
        ci.invoice_date,
        ci.due_date,
        ci.total_amount,
        ci.status as invoice_status,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.address as customer_address
      FROM user_invoices ui
      LEFT JOIN customer_invoices ci ON ui.customer_invoice_id = ci.id
      LEFT JOIN contacts c ON ci.customer_id = c.id
      WHERE ui.customer_invoice_id = $1
    `;
    const { rows: invoiceRows } = await client.query(invoiceQuery, [invoiceId]);
    if (!invoiceRows[0]) throw new Error("User invoice not found");
    
    const invoice = invoiceRows[0];

    // Get invoice items
    const itemsQuery = `
      SELECT 
        cii.*,
        p.name as product_name,
        p.hsn_code,
        t.name as tax_name,
        t.value as tax_rate
      FROM customer_invoice_items cii
      LEFT JOIN products p ON cii.product_id = p.id
      LEFT JOIN taxes t ON cii.tax_id = t.id
      WHERE cii.customer_invoice_id = $1
    `;
    const { rows: items } = await client.query(itemsQuery, [invoiceId]);

    return { ...invoice, items };
  } finally {
    client.release();
  }
};

/**
 * Get customer invoice by ID with items
 */
export const getCustomerInvoiceById = async (invoiceId) => {
  const client = await pool.connect();
  try {
    // Get invoice details
    const invoiceQuery = `
      SELECT 
        ci.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.address as customer_address,
        so.id as sales_order_id,
        so.order_date as sales_order_date
      FROM customer_invoices ci
      LEFT JOIN contacts c ON ci.customer_id = c.id
      LEFT JOIN sales_orders so ON ci.so_id = so.id
      WHERE ci.id = $1
    `;
    const { rows: invoiceRows } = await client.query(invoiceQuery, [invoiceId]);
    if (!invoiceRows[0]) throw new Error("Invoice not found");
    
    const invoice = invoiceRows[0];

    // Get invoice items
    const itemsQuery = `
      SELECT 
        cii.*,
        p.name as product_name,
        p.hsn_code,
        t.name as tax_name,
        t.value as tax_rate
      FROM customer_invoice_items cii
      LEFT JOIN products p ON cii.product_id = p.id
      LEFT JOIN taxes t ON cii.tax_id = t.id
      WHERE cii.customer_invoice_id = $1
    `;
    const { rows: items } = await client.query(itemsQuery, [invoiceId]);

    return { ...invoice, items };
  } finally {
    client.release();
  }
};

/**
 * Get all invoices for a specific user
 */
export const getUserInvoices = async (userId) => {
  const query = `
    SELECT 
      ui.*,
      ci.invoice_number,
      ci.invoice_date,
      ci.due_date,
      ci.total_amount,
      ci.status as invoice_status,
      c.name as customer_name,
      c.email as customer_email,
      c.phone as customer_phone
    FROM user_invoices ui
    LEFT JOIN customer_invoices ci ON ui.customer_invoice_id = ci.id
    LEFT JOIN contacts c ON ci.customer_id = c.id
    WHERE ui.user_id = $1
    ORDER BY ui.created_at DESC
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
};

/**
 * Update invoice payment status
 */
export const updateInvoicePaymentStatus = async (userInvoiceId, paymentStatus) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Update user_invoices table
    const userInvoiceQuery = `
      UPDATE user_invoices 
      SET payment_status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *;
    `;
    const { rows: userInvoiceRows } = await client.query(userInvoiceQuery, [paymentStatus, userInvoiceId]);
    if (!userInvoiceRows[0]) throw new Error("User invoice not found");
    
    const userInvoice = userInvoiceRows[0];

    // Update customer_invoices table
    const customerInvoiceQuery = `
      UPDATE customer_invoices 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *;
    `;
    const { rows: customerInvoiceRows } = await client.query(customerInvoiceQuery, [paymentStatus, userInvoice.customer_invoice_id]);

    await client.query("COMMIT");
    return { userInvoice, customerInvoice: customerInvoiceRows[0] };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
