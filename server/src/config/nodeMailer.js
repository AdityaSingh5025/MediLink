import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.error(" Email transporter error:", error);
  } else {
    console.log("Email server ready");
  }
});

export const mailer = async (email, subject, html) => {
  try {
    if (!email || !subject || !html) {
      throw new Error("Email, subject, and html are required");
    }

    const info = await transporter.sendMail({
      from: `"Aditya Singh" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html,
    });

    // console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};
