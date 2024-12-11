import { getChannel } from "../../config/connectRabbitMQ.js";

const ROUTING_KEY = "user.sms";
const EXCHANGE_NAME = "sms_exchange";

const sendSmsOTPCode = async (message) => {
  try {
    const channel = getChannel();
    if (!channel) {
      throw new Error("Channel is not initialized");
    }
    const exchangeName = "sms_exchange";
    await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });
    await channel.publish(
      exchangeName,
      ROUTING_KEY,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
    return true;
  } catch (error) {
    console.error("Error sending message", error);
    return false;
  }
};

export { sendSmsOTPCode };
