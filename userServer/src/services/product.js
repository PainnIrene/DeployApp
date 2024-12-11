import { productClient } from "../../config/gRPC_Client.js";
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
export { getProductOptionById, getOptionInfoById, getDetailsOptionInfoById };
