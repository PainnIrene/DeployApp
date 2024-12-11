import { useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import classNames from "classnames/bind";
import styles from "./Payment.module.scss";
import Swal from "sweetalert2";

const cx = classNames.bind(styles);
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
function Payment({ orderId, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [isProcessing, setIsProcessing] = useState(false);

  const createPayPalOrder = async () => {
    try {
      const { data } = await axios.post(
        "http://localhost:3003/payment/create-session",
        {
          orderId,
          paymentMethod: "paypal",
        },
        { withCredentials: true }
      );
      console.log("PayPal session created:", data);
      return data.paymentId;
    } catch (error) {
      console.error("PayPal session creation error:", error.response || error);
      Swal.fire({
        icon: "error",
        title: "Payment Error",
        text:
          error.response?.data?.message || "Failed to create payment session",
      });
      throw error;
    }
  };

  const onPayPalApprove = async (data, actions) => {
    try {
      // 1. Capture the order first
      const captureResult = await actions.order.capture();
      
      // 2. Call backend to confirm payment
      await axios.post(
        "http://localhost:3003/payment/confirm",
        {
          orderId,
          paymentId: data.orderID,
          paymentMethod: "paypal",
        },
        { withCredentials: true }
      );

      // 3. Show success message
      await Swal.fire({
        icon: "success", 
        title: "Payment Successful",
        text: "Your order has been placed successfully!",
        confirmButtonColor: "#8c52ff",
      });

      // 4. Navigate to home page
      window.location.href = "/";

    } catch (error) {
      console.error("Payment error:", error);
      Swal.fire({
        icon: "error",
        title: "Payment Failed", 
        text: "There was an error processing your payment. Please try again.",
      });
      throw error;
    }
  };

  return (
    <div className={cx("payment-section")}>
      <h2>Select Payment Method</h2>
      <div className={cx("payment-methods")}>
        <button
          className={cx("method-btn", { active: paymentMethod === "paypal" })}
          onClick={() => setPaymentMethod("paypal")}
        >
          PayPal
        </button>
        <button
          className={cx("method-btn", { active: paymentMethod === "stripe" })}
          onClick={() => setPaymentMethod("stripe")}
        >
          Credit Card
        </button>
      </div>

      {paymentMethod === "paypal" && (
        <PayPalButtons
          style={{ layout: "horizontal" }}
          createOrder={createPayPalOrder}
          onApprove={onPayPalApprove}
        />
      )}
    </div>
  );
}

export default Payment;
