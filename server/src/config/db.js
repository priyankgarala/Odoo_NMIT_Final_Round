import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",       // your Postgres username
  host: "localhost",    // or "127.0.0.1"
  database: "SHIV_ACCOUNTS_CLOUD",// your database name
  password: "Priyank@123",// your password
  port: 5432,           // default PostgreSQL port
});

// test connection
pool.connect()
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch(err => console.error("❌ Connection error", err));

export default pool;
