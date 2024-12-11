import { getChannel } from "../config/connectRabbitMQ.js";
import {
  sendVerifyEmailCode,
  sendChangeEmailCode,
  sendResetPasswordCode,
} from "../services/mailService.js";

export async function processEmail(message) {
  const content = message.content.toString();
  const { emailAddress, code, url, action } = JSON.parse(content);
  console.log(
    `Received message: Email=${emailAddress}, Code=${code}, Action=${action}`
  );

  try {
    if (action === "verify_email") {
      await sendVerifyEmailCode(emailAddress, code, url);
    } else if (action === "change_email") {
      await sendChangeEmailCode(emailAddress, code, url);
    } else if (action === "reset_password") {
      await sendResetPasswordCode(emailAddress, code, url);
    }
  } catch (error) {
    console.error("Error processing email:", error);
  }
  const channel = getChannel();
  channel.ack(message);
}
