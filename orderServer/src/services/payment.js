import dotenv from "dotenv";
import paypal from "@paypal/checkout-server-sdk";
import Stripe from "stripe";

// Load environment variables before importing any other modules
dotenv.config();

// Verify required environment variables
const requiredEnvVars = [
  "STRIPE_SECRET_KEY",
  "PAYPAL_CLIENT_ID",
  "PAYPAL_CLIENT_SECRET",
  "CLIENT_URL",
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// PayPal configuration
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const paypalClient = new paypal.core.PayPalHttpClient(environment);

const SHIPPING_FEE = 20000; // 20,000 VND
const VND_TO_USD_RATE = 0.00004; // Approximate rate, should be updated regularly

const convertVNDtoUSD = (amountInVND) => {
  return parseFloat((amountInVND * VND_TO_USD_RATE).toFixed(2));
};

export const createPayPalOrder = async (orderId, amount) => {
  // Add shipping fee
  const totalAmountVND = amount + SHIPPING_FEE;
  const amountUSD = convertVNDtoUSD(totalAmountVND);

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: orderId,
        amount: {
          currency_code: "USD",
          value: amountUSD,
        },
        description: `Order #${orderId} with shipping`,
      },
    ],
  });

  const order = await paypalClient.execute(request);
  return order.result;
};

export const createStripeSession = async (orderId, amount) => {
  // Add shipping fee
  const totalAmountVND = amount + SHIPPING_FEE;
  const amountUSD = convertVNDtoUSD(totalAmountVND);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Order #${orderId}`,
          },
          unit_amount: Math.round(amountUSD * 100), // Stripe uses cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
  });

  return session;
};
