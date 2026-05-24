import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

console.log("SMTP HOST:", process.env.SMTP_HOST);
console.log("SMTP PORT:", process.env.SMTP_PORT);
console.log("SMTP USER:", process.env.SMTP_USER);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});

transporter.verify((error, success) => {
  if (error) {
    console.error("VERIFY ERROR:", error);
  } else {
    console.log("Email server ready");
  }
});

export const mailer = async (email, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: '"MediLink" <adityas210526@gmail.com>',
      to: email,
      subject,
      html,
    });

    console.log("EMAIL SENT:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("SEND MAIL ERROR:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};