const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const router = express.Router();

const productsFile = path.join(__dirname, "../data/products.json");

async function getProducts() {
  const data = await fs.readFile(productsFile, "utf-8");
  return JSON.parse(data);
}

async function saveProducts(products) {
  await fs.writeFile(
    productsFile,
    JSON.stringify(products, null, 2),
    "utf-8"
  );
}

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await getProducts();

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message
    });
  }
});

// GET single product
router.get("/:id", async (req, res) => {
  try {
    const products = await getProducts();
    const id = Number(req.params.id);

    const product = products.find((item) => item.id === id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message
    });
  }
});

// CREATE product
router.post("/", async (req, res) => {
  try {
    const products = await getProducts();

    const {
      name,
      category,
      price,
      quantity,
      supplier
    } = req.body;

    if (!name || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, category, price and quantity are required"
      });
    }

    const numericPrice = Number(price);
    const numericQuantity = Number(quantity);

    if (
      Number.isNaN(numericPrice) ||
      Number.isNaN(numericQuantity) ||
      numericPrice < 0 ||
      numericQuantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Price and quantity must be valid positive numbers"
      });
    }

    const newProduct = {
      id:
        products.length > 0
          ? Math.max(...products.map((product) => product.id)) + 1
          : 1,
      name: name.trim(),
      category: category.trim(),
      price: numericPrice,
      quantity: numericQuantity,
      supplier: supplier?.trim() || "Unknown",
      status:
        numericQuantity === 0
          ? "Out of Stock"
          : numericQuantity <= 10
          ? "Low Stock"
          : "In Stock"
    };

    products.push(newProduct);
    await saveProducts(products);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message
    });
  }
});

// UPDATE product
router.put("/:id", async (req, res) => {
  try {
    const products = await getProducts();
    const id = Number(req.params.id);

    const productIndex = products.findIndex(
      (product) => product.id === id
    );

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const currentProduct = products[productIndex];

    const {
      name,
      category,
      price,
      quantity,
      supplier
    } = req.body;

    const updatedProduct = {
      ...currentProduct,
      name:
        name !== undefined ? name.trim() : currentProduct.name,
      category:
        category !== undefined
          ? category.trim()
          : currentProduct.category,
      price:
        price !== undefined
          ? Number(price)
          : currentProduct.price,
      quantity:
        quantity !== undefined
          ? Number(quantity)
          : currentProduct.quantity,
      supplier:
        supplier !== undefined
          ? supplier.trim()
          : currentProduct.supplier
    };

    if (
      Number.isNaN(updatedProduct.price) ||
      Number.isNaN(updatedProduct.quantity) ||
      updatedProduct.price < 0 ||
      updatedProduct.quantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Price and quantity must be valid positive numbers"
      });
    }

    updatedProduct.status =
      updatedProduct.quantity === 0
        ? "Out of Stock"
        : updatedProduct.quantity <= 10
        ? "Low Stock"
        : "In Stock";

    products[productIndex] = updatedProduct;

    await saveProducts(products);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message
    });
  }
});

// DELETE product
router.delete("/:id", async (req, res) => {
  try {
    const products = await getProducts();
    const id = Number(req.params.id);

    const productExists = products.some(
      (product) => product.id === id
    );

    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const updatedProducts = products.filter(
      (product) => product.id !== id
    );

    await saveProducts(updatedProducts);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message
    });
  }
});

module.exports = router;