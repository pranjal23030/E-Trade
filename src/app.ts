import express from 'express'
import './database/connection'
import userRoute from './routes/userRoute'
import categoryRoute from './routes/categoryRoute'
import productRoute from './routes/productRoute'
import OrderRoute from './routes/orderRoute'

const app = express()


app.use(express.json())


// localhost:3000/api/auth/---
app.use("/api/auth", userRoute)
app.use("/api/category", categoryRoute)
app.use("/api/product", productRoute)
app.use("/api/order", OrderRoute)



export default app