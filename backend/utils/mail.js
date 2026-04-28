import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL, 
    pass: process.env.EMAIL_PASSWORD, 
  },
});

export const sendOtpMail = async(to,otp)=>{
    await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject: "Reset Your Password",
    html: `<p>Your OTP password reset is <b>${otp}</b>.It expires in 5 minutes.</p>`, // HTML body
  });
}

export const sendDeliveryOtpMail = async(user,otp)=>{
    await transporter.sendMail({
    from: process.env.EMAIL,
    to: user.email,
    subject: "Delivery OTP",
    html: `<p>Your delivery OTP is <b>${otp}</b>.It expires in 5 minutes.</p>`, // HTML body
  });
}
