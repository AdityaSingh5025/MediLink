import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true only for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter error:", error);
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
      from: `"MediLink" <${process.env.SMTP_USER}>`,
      to: email,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Error sending email:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};