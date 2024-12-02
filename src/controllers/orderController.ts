import { Request, response, Response } from "express";
import Order from "../database/models/orderModel";
import OrderDetails from "../database/models/orderDetails";
import { PaymentMethod, PaymentStatus } from "../globals/types";
import Payment from "../database/models/paymentModel";
import axios from 'axios'

interface IProduct {
    productId: string,
    productQty: string
}

interface OrderRequest extends Request {
    user?: {
        id: string
    }
}

class OrderController {
    static async createOrder(req: OrderRequest, res: Response): Promise<void> {
        const userId = req.user?.id
        const { phoneNumber, shippingAddress, totalAmount, paymentMethod } = req.body
        const products: IProduct[] = req.body.products
        if (!phoneNumber || !shippingAddress || !totalAmount || products.length == 0) {
            res.status(400).json({
                message: "Please provide phoneNumber, shippingAddress, totalAmount, products and paymentMethod"
            })
            return
        }
        // for order 
        const orderData = await Order.create({
            phoneNumber,
            shippingAddress,
            totalAmount,
            userId
        })
        // for orderDetails
        console.log(orderData, "OrderData!!")
        console.log(products)
        products.forEach(async function (product) {
            await OrderDetails.create({
                quantity: product.productQty,
                productId: product.productId,
                orderId: orderData.id
            })
        })
        /// for payment
        const paymentData = await Payment.create({
            orderId: orderData.id,
            paymentMethod: paymentMethod,
        })
        if (paymentMethod == PaymentMethod.Khalti) {
            // khalti logic
            const data = {
                return_url: "http://localhost:5173/",
                website_url: "http://localhost:5173/",
                amount: totalAmount * 100,
                purchase_order_id: orderData.id,
                purchase_order_name: "order_" + orderData.id
            }
            const response = await axios.post("https://a.khalti.com/api/v2/epayment/initiate/", data, {
                headers: {
                    Authorization: "Key 2233c265606c4488a8c24324ae6288f3"
                }
            })
            const khaltiResponse = response.data
            paymentData.pidx = khaltiResponse.pidx
            paymentData.save()
            res.status(200).json({
                message: "Order created successfully",
                url: khaltiResponse.payment_url,
                pidx: khaltiResponse.pidx
            })

        } else if (paymentMethod == PaymentMethod.Esewa) {
            // esewa logic

        } else {
            res.status(200).json({
                message: "Order created successfully !!"
            })
        }
    }

    static async verifyTransaction(req: OrderRequest, res: Response): Promise<void> {
        const { pidx } = req.body
        if (!pidx) {
            res.status(400).json({
                message: "Please provide pidx"
            })
            return
        }
        const response = await axios.post("https://a.khalti.com/api/v2/epayment/lookup/", {
            pidx: pidx
        }, {
            headers: {
                "Authorization": "Key 2233c265606c4488a8c24324ae6288f3"
            }
        })
        const data = response.data
        if (data.status === "Completed") {
            await Payment.update({ paymentStatus: PaymentStatus.Paid }, {
                where: {
                    pidx: pidx
                }
            })
            res.status(200).json({
                message: "Payment verified successfully !!"
            })
        } else {
            res.status(200).json({
                message: "Payment not verified or cancelled."
            })
        }

    }
}

export default OrderController

/* 
{  
    shippingAddress : "Itahari", 
    phoneNumber : 912323, 
    totalAmount : 1232, 
    products : [
        {
            productId : 89123123, 
            qty : 2 
        },
        
        {
            productId : 123123, 
            qty : 1
        }
    ]
}
*/