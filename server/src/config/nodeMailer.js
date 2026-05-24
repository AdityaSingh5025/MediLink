import dotenv from "dotenv";
import SibApiV3Sdk from "sib-api-v3-sdk";

dotenv.config();

const defaultClient = SibApiV3Sdk.ApiClient.instance;

const apiKey =
  defaultClient.authentications["api-key"];

apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance =
  new SibApiV3Sdk.TransactionalEmailsApi();

export const mailer = async (email, subject, html) => {
  try {
    const sendSmtpEmail = {
      sender: {
        email: "adityas210526@gmail.com",
        name: "MediLink",
      },

      to: [
        {
          email,
        },
      ],

      subject,
      htmlContent: html,
    };

    const data =
      await apiInstance.sendTransacEmail(
        sendSmtpEmail
      );

    console.log("EMAIL SENT:", data);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("BREVO ERROR:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};