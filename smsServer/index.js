import dotenv from "dotenv";
dotenv.config();
import { connectRabbitMQ, closeConnection } from "./config/connectRabbitMQ.js";
import { startSMSConsumer } from "./controllers/rabbitmqController.js";
import { connectMQTT } from "./config/connectMQTT.js";
async function startEmailService() {
  await connectRabbitMQ();
  connectMQTT();
  const queueName = "sms_user_queue";
  startSMSConsumer(queueName);

  // Gracefully close the connection on exit
  process.on("exit", () => closeConnection());
  process.on("SIGINT", () => process.exit());
  process.on("SIGTERM", () => process.exit());
}

startEmailService();
