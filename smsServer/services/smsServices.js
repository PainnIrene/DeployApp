import { getMQTTClient } from "../config/connectMQTT.js";
const publishMessageOTPCodeVerify = async (topic, phone, code) => {
  try {
    const client = getMQTTClient();
    const message = {
      phone: phone,
      msg: "Ipaine Shop Your verify Code is " + code,
    };
    if (client) {
      client.publish(topic, JSON.stringify(message), { qos: 2 }, (err) => {
        if (err) {
          console.error("Failed to publish message", err);
        } else {
          console.log("Message published to topic " + topic);
        }
      });
    } else {
      console.error("MQTT client is not connected");
    }
  } catch (error) {
    console.error("Error sending verification email", error);
  }
};
const publishMessageOTPCodeChangePhone = async (topic, phone, code) => {
  try {
    const client = getMQTTClient();
    const message = {
      phone: phone,
      msg: "Your code to change new phone is " + code,
    };
    if (client) {
      client.publish(topic, JSON.stringify(message), { qos: 2 }, (err) => {
        if (err) {
          console.error("Failed to publish message", err);
        } else {
          console.log("Message published to topic " + topic);
        }
      });
    } else {
      console.error("MQTT client is not connected");
    }
  } catch (error) {
    console.error("Error sending verification email", error);
  }
};
export { publishMessageOTPCodeVerify, publishMessageOTPCodeChangePhone };
