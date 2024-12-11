import { getChannel } from "../config/connectRabbitMQ.js";
import {
  publishMessageOTPCodeVerify,
  publishMessageOTPCodeChangePhone,
} from "./smsServices.js";

export async function processSMS(message) {
  const content = message.content.toString();
  const { phone, code, action } = JSON.parse(content);
  console.log(`Received message: SMS=${phone}, code=${code}, Action=${action}`);
  const phoneSent =
    phone[0] === "+" && phone.slice(1, 3) === "84"
      ? "0" + phone.slice(3)
      : phone;
  try {
    if (action === "send_otp_verify") {
      publishMessageOTPCodeVerify("send/sms", phoneSent, code);
      console.log("Send sms to phone: " + phoneSent + " successful");
    } else if (action === "send_otp_change") {
      publishMessageOTPCodeChangePhone("send/sms", phoneSent, code);
      console.log("Send sms to phone: " + phoneSent + " successful");
    }
  } catch (error) {
    console.error("Error processing sms:", error);
  }
  const channel = getChannel();
  channel.ack(message);
}
