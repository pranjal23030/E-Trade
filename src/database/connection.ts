import { BelongsTo, Sequelize } from "sequelize-typescript";
import { envConfig } from "../config/config";
import Product from "./models/productModel";
import Category from "./models/categoryModel";
import User from "./models/userModel";
import Order from "./models/orderModel";
import Payment from "./models/paymentModel";
import OrderDetails from "./models/orderDetails";
import Cart from "./models/cartModel";

const sequelize = new Sequelize(envConfig.connectionString as string, {
    models: [__dirname + '/models']
})

try {
    sequelize.authenticate()
        .then(() => {
            console.log("Authentication successfull.😊")
        })
        .catch(err => {
            console.log("Error occured 🙁🙁", err)
        })
} catch (error) {
    console.log(error)
}

sequelize.sync({ force: false, alter: false }).then(() => {
    console.log("Changes added to database. 👍👍")
})

// Relationships

// any product belongs to a category and a category has a product
// categoryId in product table

Product.belongsTo(Category, { foreignKey: 'categoryId' })
Category.hasOne(Product, { foreignKey: 'categoryId' })

// user can order many thngs and the order belongs to the user, kunchai user le kun order gareko
// userId in order table

User.hasMany(Order, { foreignKey: 'userId' })
Order.belongsTo(User, { foreignKey: 'userId' })

// an order has payment
// orderId in payments table

Payment.belongsTo(Order, { foreignKey: 'orderId' })
Order.hasOne(Payment, { foreignKey: 'orderId' })

// orderId in orderDetails
OrderDetails.belongsTo(Order, { foreignKey: 'orderId' })
Order.hasOne(OrderDetails, { foreignKey: 'orderId' })

// productId in orderDetails
OrderDetails.belongsTo(Product, { foreignKey: 'productId' })
Product.hasMany(OrderDetails, { foreignKey: 'productId' })

// Cart and user
Cart.belongsTo(User, { foreignKey: "userId" })
User.hasOne(Cart, { foreignKey: "userId" })

// Cart and product
Cart.belongsTo(Product, { foreignKey: "productId" })
Product.hasMany(Cart, { foreignKey: "productId" })

export default sequelize