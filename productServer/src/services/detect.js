import { getChannel } from "../config/connectRabbitMQ.js";

const ROUTING_KEY = "product.detect";
const EXCHANGE_NAME = "product_exchange";

const validationProduct = async (message) => {
  try {
    const channel = getChannel();
    if (!channel) {
      throw new Error("Channel is not initialized");
    }
    const exchangeName = "product_exchange";
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

export { validationProduct };
