import { Request, Response } from "express";
import User from "../database/models/userModel";
import bcrypt from 'bcrypt'

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
            password: bcrypt.hashSync(password, 12)
        })

        res.status(201).json({
            message: "User registered successfully"
        })
    }

    static async login(req: Request, res: Response) {

        // Accept incoming data : email and password
        const { email, password } = req.body
        if (!email || !password) {
            res.status(400).json({
                message: "Please provide email, password. "
            })
            return
        }

        // First check email exists or not
        const [user] = await User.findAll({ // Find = FindAll (array return), FindById = FindByPk (object return)
            where: {
                email: email
            }
        })

        if (!user) {
            res.status(404).json({
                message: "No user with that email address 😥 "
            })
        } else {
            // If email exists then check the password
            const isequal = bcrypt.compareSync(password, user.password)
            if (!isequal) {
                res.status(400).json({
                    message: "Invalid password 🙁"
                })
            } else {
                // If password correct and everything is valid, generate token (jwt)
                res.status(200).json({
                    message: "Logged in successfully !! 😀 "
                })
            }
        }
    }
}

export default UserController