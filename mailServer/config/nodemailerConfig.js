import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER_NOREPLY,
    pass: process.env.SMTP_PASS_NOREPLY,
  },
  tls: {
    rejectUnauthorized: false, // Bỏ qua xác minh chứng chỉ
  },
});

export default transporter;
