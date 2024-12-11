import { productClient } from "../config/gRPC_Client.js";
const getProductOptionById = async (productId, value1, value2) => {
  return new Promise((resolve, reject) => {
    productClient.GetInstockOfProduct(
      { productId, value1, value2 },
      (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      }
    );
  });
};
const getOptionInfoById = async (optionId) => {
  return new Promise((resolve, reject) => {
    productClient.GetPartOfProductInfo({ optionId }, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};
const getDetailsOptionInfoById = async (optionId) => {
  return new Promise((resolve, reject) => {
    productClient.GetDetailsProductInfo({ optionId }, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};
const checkInventory = async (items) => {
  return new Promise((resolve, reject) => {
    productClient.CheckProductInventory(
      {
        items: items.map((item) => ({
          productId: item.productId,
          optionId: item.optionId,
          quantity: item.quantity,
        })),
      },
      (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      }
    );
  });
};
const updateCartAfterOrder = async (userId, optionIds) => {
  return new Promise((resolve, reject) => {
    productClient.UpdateCartAfterOrder(
      {
        userId,
        optionIds,
      },
      (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      }
    );
  });
};
const updateProductInventory = async (productId, optionId, quantity) => {
  console.log(
    "Request update Product Inventory",
    productId,
    optionId,
    quantity
  );
  return new Promise((resolve, reject) => {
    productClient.UpdateProductInventory(
      { productId, optionId, quantity },
      (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      }
    );
  });
};
export {
  getProductOptionById,
  getOptionInfoById,
  getDetailsOptionInfoById,
  checkInventory,
  updateCartAfterOrder,
  updateProductInventory,
};
