import pool from "../config/db.js";

export const getDefaultAccountIds = async () => {
    const query = `
      SELECT
        (SELECT id FROM chart_of_accounts WHERE account_name = 'Sales Income' LIMIT 1) AS sales_account_id,
        (SELECT id FROM chart_of_accounts WHERE account_name = 'Purchases Expense' LIMIT 1) AS purchase_account_id
    `;
    const { rows } = await pool.query(query);
    return rows[0];
  };
