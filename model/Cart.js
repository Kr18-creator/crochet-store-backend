const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    products: [
      {
        _id: false, // Exclude _id field for each product in the array
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: false },
      },
    ],
  }
);

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
