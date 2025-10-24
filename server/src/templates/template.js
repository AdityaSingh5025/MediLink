import fs from "fs";
import path from "path";

const templatesDir = path.join(process.cwd(), "src", "templates");

export const templates = {
  resetLink: fs.readFileSync(path.join(templatesDir, "resetPasLink.html"), "utf8"),
  resetSuccess: fs.readFileSync(path.join(templatesDir, "resetPasSuccess.html"), "utf8"),
  otpMail: fs.readFileSync(path.join(templatesDir, "otpMailTemp.html"), "utf8"),
  deleteAccount : fs.readFileSync(path.join(templatesDir, "deleteAccTemp.html"), "utf8"),
};
