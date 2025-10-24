import { templates } from "../templates/template.js";
import { mailer } from "../config/nodeMailer.js";

export const sendVerificationEmail = async (email, otp) => {
  const htmlTemplate = templates.otpMail
    .replace("{{otp}}", otp)
    .replace("{{year}}", new Date().getFullYear());
  await mailer(email, "Verification OTP", htmlTemplate);
};