import client from "../config/gRPC_Client.js";
const uploadSingleFile = async (
  userId,
  bucketName,
  bucketFolder,
  file,
  fileExtension
) => {
  if (!file || !fileExtension) {
    throw new Error("No file uploaded");
  }
  try {
    const uploadRequest = {
      userId,
      bucketName,
      bucketFolder,
      image: file,
      fileExtension,
    };

    const uploadResponse = await new Promise((resolve, reject) => {
      client.UploadSingleFile(uploadRequest, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });

    if (uploadResponse.success) {
      return uploadResponse.url;
    } else {
      return "";
    }
  } catch (error) {
    console.error(error);
    return "";
  }
};
const UploadProductImages = async (
  userId,
  productId,
  bucketName,
  bucketFolder,
  promotionImage,
  productImages,
  optionImages
) => {
  try {
    const uploadRequest = {
      userId,
      productId,
      bucketName,
      bucketFolder,
      promotionImage,
      productImages,
      optionImages,
    };

    const uploadResponse = await new Promise((resolve, reject) => {
      client.UploadProductImages(uploadRequest, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });

    // If uploadResponse is defined and contains data
    if (uploadResponse) {
      const promotionImageUrl = uploadResponse.promotionImageUrl
        ? uploadResponse.promotionImageUrl.url
        : "";
      const productImageUrls = uploadResponse.productImageUrls.map(
        (result) => result.url
      );
      const optionImageUrls = uploadResponse.optionImageUrls.map(
        (result) => result.url
      );

      return {
        promotionImageUrl: promotionImageUrl ? promotionImageUrl : "",
        productImageUrls: productImageUrls.length ? productImageUrls : [],
        optionImageUrls: optionImageUrls.length ? optionImageUrls : [],
      };
    } else {
      // Return empty arrays if no response or failed to get response
      return {
        promotionImageUrl: [],
        productImageUrls: [],
        optionImageUrls: [],
      };
    }
  } catch (error) {
    console.error("Error uploading product images:", error);
    // Return empty arrays if there was an error
    return {
      promotionImageUrl: [],
      productImageUrls: [],
      optionImageUrls: [],
    };
  }
};

export { uploadSingleFile, UploadProductImages };
