import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import Product from './models/product.model.js'
import mongoose, { mongo } from 'mongoose'

dotenv.config()

const app = express()

// Middleware that allows us to accept JSON in the request.body
app.use(express.json())

app.get('/api/products', async (req,res) => {
    try {
        const products = await Product.find({})
        res.status(200).json({success:true, data: products})
    } catch (error) {
        console.log("error in fetching products:", error.message)
        res.status(500).json({success: false, message: "server error"})
    }
})

app.post('/api/products',  async (req,res) => {
    const product = req.body // This line extracts the data sent by the user in the request body and assigns it to the product variable. The req.body typically contains JSON data sent by the client.
    
// this block checks if the product object has all the required fields (name, price, and image). If any of these fields are missing, the server responds with a 400 Bad Request status and a JSON object containing a success flag (false) and an error message.
    if(!product.name || !product.price || !product.image) {
        return res.status(400).json({success:false, message: "please provide all fields"})
    }
    // This line creates a new instance of the Product model (likely a Mongoose model if you're using MongoDB) using the data provided in the product object. This instance represents a new product that will be saved to the database.
    const newProduct = new Product(product)

    try {
        await newProduct.save()// saves new product once promise is resolved
        
        res.status(201).json({success: true, data: newProduct})
        
    } catch (error) {
        console.error("error in Create product:", error.message)
        res.status(500).json({success: false, message: "Server error"})
    }
    
})

app.put('/api/products/:id', async (req,res) => {
    const {id} = req.params
    const product = req.body
    if(!mongoose.Types.ObjectId.isValid(id)) {
       return res.status(404).json({success:false, message: "invalid product id"})
    }
    try {
     const updatedProduct = await Product.findByIdAndUpdate(id , product, {new:true})
     res.status(200).json({success: true, data: updatedProduct})
    } catch (error) {
        res.status(500).json({success:false, message:"server error"})
    }
})

app.delete('/api/products/:id', async (req,res) => {
    const { id } = req.params
    
    try {
        await Product.findByIdAndDelete(id)
        res.status(200).json({success: true, message: "product deleted"})
    } catch (error) {
        
        res.status(404).json({success: false, message: "product not found"})
    }
}
)


app.listen(1996, () => {
    connectDB()
    console.log('Server running on http://localhost:1996')
})

