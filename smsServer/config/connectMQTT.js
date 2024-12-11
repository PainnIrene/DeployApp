// connectMQTT.js
import mqtt from "mqtt";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

let client = null;

// Hàm kết nối đến MQTT server
export function connectMQTT() {
  const mqttUrl = `mqtts://${process.env.MQTT_USERNAME}:${process.env.MQTT_PASSWORD}@${process.env.MQTT_HOSTNAME}:${process.env.MQTT_PORT}`; // Sử dụng mqtts cho kết nối SSL

  // Lấy đường dẫn đến thư mục hiện tại
  const __filename = new URL(import.meta.url).pathname;
  const __dirname = path.dirname(__filename);

  // Đường dẫn đến chứng chỉ CA
  const ca = fs.readFileSync(path.resolve(__dirname, "../certs/ca.crt")); // Cập nhật đường dẫn

  // Tùy chọn kết nối
  const options = {
    ca: [ca], // Chỉ định chứng chỉ CA
  };

  client = mqtt.connect(mqttUrl, options);

  client.on("connect", () => {
    console.log("Connected to MQTT server with SSL/TLS");
  });

  client.on("error", (error) => {
    console.error("Error connecting to MQTT server:", error);
  });

  client.on("message", (topic, message) => {
    console.log(`Received message from topic ${topic}: ${message.toString()}`);
  });
}

// Hàm để lấy client MQTT
export function getMQTTClient() {
  return client;
}

// Hàm disconnect
export function disconnectMQTT() {
  if (client) {
    client.end(() => {
      console.log("Disconnected from MQTT server");
    });
  }
}
