require("dotenv").config({ path: ".env" });
const express =require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const port = 8080;
app.use(cors());

app.use(express.json());
const { MONGODB_URL } = process.env;
console.log("MONGODB_URL", MONGODB_URL);

//db connection
mongoose.connect(MONGODB_URL)
.then (()=>{
    console.log("DB connection established");
})
    .catch((error)=>{
        console.error("DB connection failed:", error);
    
    })




app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    });









app.post('/cart', (req, res) => {
    // Assuming the request body contains the product ID
    const productId = req.body.productId;
    // TODO: Implement the logic to add the product to the cart using the product ID
    // For example, you can store the product ID in an array or a database
    
    res.status(200).json({ message: 'Product added to cart' });
});
app.delete('/cart', (req, res) => {
    // Assuming the request body contains the product ID
    // const productId = req.body.productId;
    // // Remove the product from the cart
    res.status(200).json({ message: 'Product removed from cart'});
});
app.get('/cart', (req, res) => {
    // // Get the products from the cart 
    const products = ["product1", "product2", "product3"]; 
    res.status(200).json({ products });
});
