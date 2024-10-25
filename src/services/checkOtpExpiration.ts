import { Response } from "express"
import sendResponse from "./sendResponse"

const checkOtpExpiration = (res: Response, otpGeneratedTime: string, thresholdTime: number) => {
    const currentTime = Date.now()
    if (currentTime - parseInt(otpGeneratedTime) <= thresholdTime) {
        // OTP isn't expired
        sendResponse(res, 200, "OTP is valid, you can procceed to reset password.")
    } else {
        // OTP is expired
        sendResponse(res, 403, "OTP is expired, Try again later !! 🙁 ")
    }
}

export default checkOtpExpiration