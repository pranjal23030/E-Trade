import { Request, Response } from "express";
import Product from "../database/models/productModel";
import Category from "../database/models/categoryModel";


// interface ProductRequest extends Request {
//     file?: {
//         filename: string,
//         fieldname: string,
//     },

// }

class ProductController {
    async createProduct(req: Request, res: Response): Promise<void> {
        const { productName, productDescription, productPrice, productTotalStock, discount, categoryId } = req.body
        const filename = req.file ? req.file.filename : "https://randomicle.com/static/media/parcel.9f551831.png"
        if (!productName || !productDescription || !productPrice || !productTotalStock || !categoryId) {
            res.status(400).json({
                message: "Please provide productName, productDescription, productPrice, productTotalStock, discount and categoryId"
            })
            return
        }
        await Product.create({
            productName,
            productDescription,
            productPrice,
            productTotalStock,
            discount: discount || 0,
            categoryId: categoryId,
            productImage: filename
        })
        res.status(200).json({
            message: "Product created successfully."
        })
    }

    async getAllProducts(req: Request, res: Response): Promise<void> {
        const datas = await Product.findAll({
            include: [
                {
                    model: Category,
                    attributes: ['id', 'categoryName'] // Only Id and Category Name
                }
            ]
        })
        res.status(200).json({
            message: "Products fetched successfully.",
            data: datas
        })
    }

    async getSingleProduct(req: Request, res: Response): Promise<void> {
        const { id } = req.params
        const [datas] = await Product.findAll({
            where: {
                id: id
            },
            include: [
                {
                    model: Category,
                    attributes: ['id', 'categoryName'] // Only Id and Category Name
                }
            ]
        })
        res.status(200).json({
            message: "Product fetched successfully.",
            data: datas
        })
    }

    async deleteProduct(req: Request, res: Response): Promise<void> {
        const { id } = req.params
        const datas = await Product.findAll({
            where: {
                id: id
            }
        })
        if (datas.length === 0) {
            res.status(404).json({
                message: "No product with that id !!"
            })
        } else {
            await Product.destroy({
                where: {
                    id: id
                }
            })
            res.status(200).json({
                message: "Product deleted successfully.",
                data: datas
            })
        }
    }
}

export default new ProductController