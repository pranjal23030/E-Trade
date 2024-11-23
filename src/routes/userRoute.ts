import express from 'express'
import UserController from '../controllers/userController'
import errorHandler from '../services/errorHandler'
const router = express.Router()

// router.post("/register",UserController.register)
// router.get("/register",UserController.register)

router.route("/register").post(errorHandler(UserController.register))
router.route("/login").post(errorHandler(UserController.login))
router.route("/forgot-password").post(errorHandler(UserController.handleForgotPassword))
router.route("/verify-otp").post(errorHandler(UserController.verifyOTP))
router.route("/reset-password").post(errorHandler(UserController.resetPassword))

export default router