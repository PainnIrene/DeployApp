import dotenv from "dotenv";
dotenv.config();
import { connectRabbitMQ, closeConnection } from "./config/connectRabbitMQ.js";
import { startEmailConsumer } from "./controllers/rabbitmqController.js";

async function startEmailService() {
  await connectRabbitMQ();

  const queueName = "email_user_queue";
  startEmailConsumer(queueName);

  // Gracefully close the connection on exit
  process.on("exit", () => closeConnection());
  process.on("SIGINT", () => process.exit());
  process.on("SIGTERM", () => process.exit());
}

startEmailService();
