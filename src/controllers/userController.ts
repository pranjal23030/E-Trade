import { Request, Response } from "express";
import User from "../database/models/userModel";
import bcrypt from 'bcrypt'
import generateToken from "../services/generateToken";
import generateOtp from "../services/generateOtp";
import sendMail from "../services/sendMail";
import findData from "../services/findData";
import sendResponse from "../services/sendResponse";
import checkOtpExpiration from "../services/checkOtpExpiration";

class UserController {
    static async register(req: Request, res: Response) {
        // Incoming user data receive
        const { username, email, password } = req.body
        // Server side validation
        if (!username || !email || !password) {
            sendResponse(res, 400, "Please provide username, email, password.")
            return
        }
        // Check whether that email alreadys exists or not
        const [data] = await User.findAll({
            where: {
                email: email
            }
        })
        if (data) {
            res.status(400).json({
                message: "Please try again later !!"
            })
            return
        }
        // Add data to the users table
        await User.create({
            username,
            email,
            password: bcrypt.hashSync(password, 12)
        })

        sendResponse(res, 201, "User registered successfully.")

        await sendMail({
            to: email,
            subject: "Registration Successfull !!!",
            text: "You are successfully registered to E-TRADE !! "
        })
    }

    static async login(req: Request, res: Response) {

        // Accept incoming data : email and password
        const { email, password } = req.body
        if (!email || !password) {
            sendResponse(res, 400, "Please provide email, password. ")
            return
        }

        // First check email exists or not
        const [user] = await User.findAll({ // Find = FindAll (array return), FindById = FindByPk (object return)
            where: {
                email: email
            }
        })

        if (!user) {
            sendResponse(res, 404, "No user with that email address 😥 ")
        } else {
            // If email exists then check the password
            const isequal = bcrypt.compareSync(password, user.password)
            if (!isequal) {
                sendResponse(res, 400, "Invalid password 🙁")
            } else {
                // If password correct and everything is valid, generate token (jwt)
                const token = generateToken(user.id)
                sendResponse(res, 200, 'Logged in successfully  😀 ', token)
            }
        }
    }

    static async handleForgotPassword(req: Request, res: Response) {
        const { email } = req.body
        if (!email) {
            sendResponse(res, 400, "Please provide email address .")
            return
        }

        const user = await findData(User, email)

        if (!user) {
            sendResponse(res, 400, 'Email is not registered. ')
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

        sendResponse(res, 200, "Password Reset OTP sent !!")
    }

    static async verifyOTP(req: Request, res: Response) {
        const { otp, email } = req.body
        if (!otp || !email) {
            sendResponse(res, 404, "Please provide otp and email.")
            return
        }

        const user = await findData(User, email)
        if (!user) {
            sendResponse(res, 404, "No user with that email.")
            return
        }

        // OTP verification
        const [data] = await User.findAll({
            where: {
                otp,
                email
            }
        })
        if (!data) {
            sendResponse(res, 404, "Invalid OTP.")
            return
        }

        // Check OTP expiration
        const currentTime = Date.now()
        const otpGeneratedTime = data.otpGeneratedTime
        checkOtpExpiration(res, otpGeneratedTime, 120000)
    }

    static async resetPassword(req: Request, res: Response) {
        const { newPassword, confirmPassword, email } = req.body
        if (!newPassword || !confirmPassword || !email) {
            sendResponse(res, 400, 'Please provide newPassword, confirmPassword, email, otp.')
            return
        }
        if (newPassword !== confirmPassword) {
            sendResponse(res, 400, 'newPassword and confirmPassword must be same.')
            return
        }
        const user = await findData(User, email)
        if (!user) {
            sendResponse(res, 404, 'No email with that user.')
        }
        user.password = bcrypt.hashSync(newPassword, 12)
        await user.save()
        sendResponse(res, 300, 'Password reset successfully !!')
    }
}

export default UserController