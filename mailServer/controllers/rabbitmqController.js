import { processEmail } from "../services/rabbitmqService.js";
import { getChannel } from "../config/connectRabbitMQ.js";

export function startEmailConsumer(queueName) {
  const channel = getChannel();
  channel.consume(
    queueName,
    async (message) => {
      await processEmail(message);
    },
    { noAck: false }
  );
}
