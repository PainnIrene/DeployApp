import { processSMS } from "../services/rabbitmqService.js";
import { getChannel } from "../config/connectRabbitMQ.js";

export function startSMSConsumer(queueName) {
  const channel = getChannel();
  channel.consume(
    queueName,
    async (message) => {
      await processSMS(message);
    },
    { noAck: false }
  );
}
