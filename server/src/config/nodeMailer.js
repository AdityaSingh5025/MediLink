import nodemailer from "nodemailer";
import dotenv from 'dotenv'


dotenv.config()

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const mailer = async (email, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: "Aditya Singh",
      to: email,
      subject: subject,
      html
    });
    console.log("email sent", info.messageId);
     return { success: true, info };
  } catch (error) {
    console.error("Error sending email:", error);
     return { success: false, error: error.message };
  }
};
