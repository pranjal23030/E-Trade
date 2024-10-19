import { Request, Response } from "express";
import User from "../database/models/userModel";

class UserController {
    static async register(req: Request, res: Response) {
        // Incoming user data receive
        const { username, email, password } = req.body
        // Server side validation
        if (!username || !email || !password) {
            res.status(400).json({
                message: "Please provide username, email, password"
            })
            return
        }

        // Add data to the users table
        await User.create({
            username,
            email,
            password
        })

        res.status(201).json({
            message: "User registered successfully"
        })
    }
}

export default UserController