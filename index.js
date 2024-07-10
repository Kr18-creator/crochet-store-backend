require("dotenv").config({ path: ".env" });
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Cart = require("./models/Cart");
const Product = require("./models/Product");

const port = 8080;
const app = express();
app.use(cors());

// Middleware
app.use(express.json());
const { MONGODB_URL } = process.env;

//db connection
mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("DB connection established");
  })
  .catch((error) => {
    console.error("DB connection failed:", error);
  });

// Routes

// Add a product
app.post("/product/add", async (req, res) => {
  const { name, price, image, description } = req.body;

  try {
    const product = new Product({ name, price, image, description });
    await product.save();
    res.status(201).json({ message: "Product added", product });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add a product to the cart
app.post("/cart/add", async (req, res) => {
  const productId = req.body.productId;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    let cart = await Cart.findOne();
    if (!cart) {
      cart = new Cart({ products: [] });
    }

    // Check if the product is already in the cart
    const existingProductIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (existingProductIndex !== -1) {
      return res
        .status(200)
        .json({ message: "Product already in cart updating the count" });
    }

    // Add the product to the cart
    cart.products.push({
      productId: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
    });

    // Save the cart
    await cart.save();

    res
      .status(200)
      .json({ message: `Product ${product.name} added to cart`, cart });
  } catch (err) {
    console.error("Error adding product to cart:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Remove a product from the cart
app.delete("/cart/delete", async (req, res) => {
  const productId = req.body.productId;
  console.log("productId", productId);

  try {
    const product = await Product.findById(productId);
    console.log("product", product);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const cart = await Cart.findOne();
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Find the index of the product in the cart
    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    console.log("cart", cart.products);
    console.log("productIndex", productIndex);
    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not in cart" });
    }

    // Remove the product from the cart
    const removedProduct = cart.products.splice(productIndex, 1)[0];
    await cart.save();

    res.status(200).json({
      message: `${removedProduct.name} removed from cart`,
      removedProduct: removedProduct,
    });
  } catch (err) {
    console.error("Error removing product from cart:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all products in the cart
app.get("/cart/all", async (req, res) => {
  try {
    // Find the cart
    const cart = await Cart.findOne();
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Map the products array to an array of promises that fetch product details
    const productDetailsPromises = cart.products.map(async (item) => {
      const product = await Product.findById(item.productId);
      return product
        ? {
            productId: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            description: product.description,
          }
        : null;
    });

    // Wait for all promises to resolve
    const productDetails = await Promise.all(productDetailsPromises);
    console.log("productDetails", productDetails);

    // Filter out null values
    const validProducts = productDetails.filter((item) => item !== null);
    console.log("validProducts", validProducts);

    // Return the updated cart with product details
    res
      .status(200)
      .json({ cart: { ...cart.toObject(), products: validProducts } });
  } catch (err) {
    console.error("Error getting cart:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all products
app.get("/products/all", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ products });
  } catch (err) {
    console.error("Error getting products:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
