import { Request, Response } from "express";
import User from "../database/models/userModel";
import bcrypt from 'bcrypt'
import generateToken from "../services/generateToken";
import generateOtp from "../services/generateOtp";
import sendMail from "../services/sendMail";

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

        await sendMail({
            to: email,
            subject: "Registration Successfull!!!",
            text: "You are successfully registered to E-TRADE !! "
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
                const token = generateToken(user.id)
                res.status(200).json({
                    message: "Logged in successfully !! 😀 ",
                    token
                })
            }
        }
    }

    static async handleForgotPassword(req: Request, res: Response) {
        const { email } = req.body
        if (!email) {
            res.status(400).json({ message: "Please provide email address.." })
            return
        }

        const [user] = await User.findAll({
            where: {
                email: email
            }
        })
        if (!user) {
            res.status(400).json({
                email: "Email is not registered."
            })
            return
        }

        // If user is regestered, generate OTP and send in mail
        const otp = generateOtp()
        await sendMail({
            to: email,
            subject: "E-TRADE Password Change Request",
            text: `This is your request to change password . The OTP is : ${otp}`
        })

        user.otp = otp.toString()
        user.otpGeneratedTime = Date.now().toString()
        await user.save()

        res.status(200).json({
            message: "Password Reset OTP sent !!"
        })
    }
}

export default UserController