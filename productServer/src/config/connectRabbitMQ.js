import amqp from "amqplib";
import { updateProductStatus } from "../utils/validate.js";

let connection = null;
let channel = null;

export async function connectRabbitMQ() {
  try {
    const username = process.env.RABBITMQ_USERNAME;
    const password = process.env.RABBITMQ_PASSWORD;
    const host = process.env.RABBITMQ_HOSTNAME;
    const port = process.env.RABBITMQ_PORT;
    const vhost = process.env.RABBITMQ_VHOST;
    const url = `amqp://${username}:${password}@${host}:${port}${vhost}`;

    connection = await amqp.connect(url);
    channel = await connection.createChannel();
    console.log("Connected to RabbitMQ");

    const productExchangeName = "product_exchange";
    await channel.assertExchange(productExchangeName, "direct", {
      durable: true,
    });

    const productQueueName = "product_queue";
    await channel.assertQueue(productQueueName, { durable: true });

    const detectRoutingKey = "product.detect";
    await channel.bindQueue(
      productQueueName,
      productExchangeName,
      detectRoutingKey
    );

    const detectQueueName = "detect_product_queue";
    await channel.assertQueue(detectQueueName, { durable: true });

    channel.consume(detectQueueName, async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          console.log("Received message from detect_product_queue:", content);

          // Update product status based on detection result
          await updateProductStatus(content);

          // Acknowledge the message
          channel.ack(msg);
        } catch (error) {
          console.error("Error processing message:", error);
          // Nack the message if there's an error
          channel.nack(msg);
        }
      }
    });
  } catch (error) {
    console.error("Error connecting to RabbitMQ", error);
    process.exit(1);
  }
}

export function getChannel() {
  return channel;
}

export function closeConnection() {
  if (connection) {
    connection.close();
  }
}
