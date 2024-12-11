import Product from "../models/Product.js";

const isSellerOwnProduct = async (sellerId, productId) => {
  try {
    const product = await Product.findOne(
      { _id: productId, sellerId: sellerId },
      "_id"
    );
    return product ? true : false;
  } catch (error) {
    return false;
  }
};
const getProductInfoToValidate = async (productId) => {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return null;
    }

    const productImages = [];

    if (product.images && product.images.length > 0) {
      productImages.push(...product.images);
    }

    if (product.promotionImage) {
      productImages.push(product.promotionImage);
    }

    if (product.options && product.options.length > 0) {
      product.options.forEach((option) => {
        if (option.image) {
          productImages.push(option.image);
        }
      });
    }

    return {
      _id: product._id,
      productName: product.name,
      productDescription: product.description,
      productImages: productImages,
    };
  } catch (error) {
    console.error("Error getting product information for validation:", error);
    throw error;
  }
};

export { isSellerOwnProduct, getProductInfoToValidate };
