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

    // Kết nối đến RabbitMQ
    connection = await amqp.connect(url);
    channel = await connection.createChannel();
    console.log("Connected to RabbitMQ");

    // Tạo exchange cho email
    const emailExchangeName = "email_exchange";
    await channel.assertExchange(emailExchangeName, "direct", {
      durable: true,
    });

    // Tạo queue cho email
    const emailQueueName = "email_user_queue";
    await channel.assertQueue(emailQueueName, { durable: true });

    // Bind queue cho email
    const emailRoutingKey = "user.email";
    await channel.bindQueue(emailQueueName, emailExchangeName, emailRoutingKey);

    // Tạo exchange cho SMS
    const smsExchangeName = "sms_exchange";
    await channel.assertExchange(smsExchangeName, "direct", { durable: true });

    // Tạo queue cho SMS
    const smsQueueName = "sms_user_queue";
    await channel.assertQueue(smsQueueName, { durable: true });

    // Bind queue cho SMS
    const smsRoutingKey = "user.sms";
    await channel.bindQueue(smsQueueName, smsExchangeName, smsRoutingKey);
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
