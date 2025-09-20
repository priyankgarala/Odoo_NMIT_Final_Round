import express from 'express';
// import connectDB from './src/config/mongo.config.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import userManagementRoutes from './src/routes/userManagementRoutes.js';
import cors from 'cors';
import productRoutes from './src/routes/productRoutes.js';
import taxRoutes from './src/routes/taxRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import path from 'path';
import { notFound, errorHandler } from './src/middlewares/errorHandler.js';
import pool from './src/config/db.js';
import { createSampleTaxes } from './src/utils/createSampleTaxes.js';
import { createSampleVendors } from './src/utils/createSampleVendors.js';
import purchaseOrderRoutes from './src/routes/purchaseOrderRoutes.js'
import salesOrderRoutes from './src/routes/salesOrderRoutes.js'
import contactRoutes from './src/routes/contactRoutes.js'
const app = express();


app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials : true
}))


dotenv.config();
app.use(express.json());
app.use(cookieParser());


// routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/user-management", userManagementRoutes);
app.use("/api/products", productRoutes);
app.use("/api/taxes", taxRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/sales-orders",salesOrderRoutes);
app.use("/api/contacts", contactRoutes);

// serve uploaded files
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

app.listen(5000, async () => {
  try {
    await pool.query("SELECT NOW()"); // quick test query
    console.log("✅ PostgreSQL connection is active");
    
    // Create sample taxes if they don't exist
    await createSampleTaxes();
    
    // Create sample vendors if they don't exist
    await createSampleVendors();
    
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:", error.message);
  }
  console.log("🚀 App running on port 5000");
});
// project