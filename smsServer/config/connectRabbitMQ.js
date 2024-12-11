import amqp from "amqplib";

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

    // Tạo exchange và hàng đợi
    const exchangeName = "sms_exchange";
    await channel.assertExchange(exchangeName, "direct", { durable: true });

    const queueName = "sms_user_queue";
    await channel.assertQueue(queueName, { durable: true });

    // Bind hàng đợi với exchange
    const routingKey = "user.sms";
    await channel.bindQueue(queueName, exchangeName, routingKey);
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
