import { cartClient } from "../config/gRPC_Client.js";

const updateCartAfterOrder = async (userId, items) => {
  console.log("Request data:", {
    userId,
    items,
  });

  return new Promise((resolve, reject) => {
    cartClient.UpdateCartAfterOrder(
      {
        userId: userId,
        items: items,
      },
      (error, response) => {
        if (error) {
          console.error("gRPC error details:", error.details);
          reject(error);
        } else {
          resolve(response);
        }
      }
    );
  });
};

export { updateCartAfterOrder };
