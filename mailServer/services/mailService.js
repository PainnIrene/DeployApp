import transporter from "../config/nodemailerConfig.js";
import fs from "fs/promises";
import path from "path";
import handlebars from "handlebars";
const readHTMLFile = async (filePath) => {
  try {
    return await fs.readFile(filePath, { encoding: "utf-8" });
  } catch (err) {
    throw new Error(`Error reading file: ${err.message}`);
  }
};

export const sendVerifyEmailCode = async (email, code, url) => {
  const templatePath = path.resolve("templates", "verificationEmail.hbs");

  try {
    const templateSource = await readHTMLFile(templatePath);
    const template = handlebars.compile(templateSource);
    const htmlToSend = template({ code, url });

    const mailOptions = {
      from: process.env.SMTP_USER_NOREPLY,
      to: email,
      subject: "Verify Your Email",
      html: htmlToSend,
    };

    await transporter.sendMail(mailOptions);
    console.log("Verification email sent");
  } catch (error) {
    console.error("Error sending verification email", error);
  }
};

export const sendChangeEmailCode = async (email, code, url) => {
  const templatePath = path.resolve("templates", "changeEmail.hbs");

  try {
    const templateSource = await readHTMLFile(templatePath);
    const template = handlebars.compile(templateSource);
    const htmlToSend = template({ code, url });

    const mailOptions = {
      from: process.env.SMTP_USER_NOREPLY,
      to: email,
      subject: "Change your email",
      html: htmlToSend,
    };

    await transporter.sendMail(mailOptions);
    console.log("Verification email sent");
  } catch (error) {
    console.error("Error sending verification email", error);
  }
};

export const sendResetPasswordCode = async (email, code, url) => {
  const templatePath = path.resolve("templates", "resetPassword.hbs");

  try {
    const templateSource = await readHTMLFile(templatePath);
    const template = handlebars.compile(templateSource);
    const htmlToSend = template({ code, url });

    const mailOptions = {
      from: process.env.SMTP_USER_NOREPLY,
      to: email,
      subject: "Reset Your Password",
      html: htmlToSend,
    };

    await transporter.sendMail(mailOptions);
    console.log("Verification email sent");
  } catch (error) {
    console.error("Error sending verification email", error);
  }
};
