const express = require("express");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");

const app = express();
const PORT = 5000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173"
  })
);

app.use(express.json());

// Welcome API
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to InventoryHub API",
    version: "1.0.0"
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "InventoryHub backend is running",
    timestamp: new Date().toISOString()
  });
});

// Product API
app.use("/api/products", productRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

app.listen(PORT, () => {
  console.log(
    `InventoryHub server running at http://localhost:${PORT}`
  );
});