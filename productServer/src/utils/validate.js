import Product from "../models/Product.js";

const updateProductStatus = async ({ _id, result }) => {
  try {
    let newStatus;

    // Xác định status dựa trên result
    switch (result) {
      case "detect":
        newStatus = "Violation";
        break;
      case "not_detect":
        newStatus = "Published";
        break;
      default:
        newStatus = "Pending";
    }

    // Update status của sản phẩm
    const updatedProduct = await Product.findByIdAndUpdate(
      _id,
      { status: newStatus },
      { new: true }
    );

    if (!updatedProduct) {
      console.error(`Product with id ${_id} not found`);
      return false;
    }

    console.log(`Updated product ${_id} status to ${newStatus}`);
    return true;
  } catch (error) {
    console.error("Error updating product status:", error);
    return false;
  }
};

export { updateProductStatus };
