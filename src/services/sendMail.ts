import nodemailer from 'nodemailer'
import { envConfig } from '../config/config'

interface Idata {
    to: string,
    subject: string,
    text: string
}

const sendMail = async (data: Idata) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: envConfig.email,
            pass: envConfig.emailPassword
        }
    })
    const mailOptions = {
        from: "E-TRADE <pranjal.khatiwoda@gmail.com>",
        to: data.to,
        subject: data.subject,
        text: data.text
    }
    try {
        await transporter.sendMail(mailOptions)
    } catch (error) {
        console.log(error)
    }
}

export default sendMail