import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import Product from "../models/Product.js";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_PATH = path.join(__dirname, "../../proto/Product.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const productServiceProto =
  grpc.loadPackageDefinition(packageDefinition).productService;

const server = new grpc.Server();
server.addService(productServiceProto.ProductService.service, {
  GetInstockOfProduct: async (call, callback) => {
    const { productId, value1, value2 } = call.request;
    console.log("Searching for product with:", { productId, value1, value2 });

    try {
      const product = await Product.findById(productId, {
        options: {
          $elemMatch: { value1: value1, value2: value2 },
        },
        sellerId: 1,
      });
      if (
        !product ||
        !product.options ||
        product.options.length === 0 ||
        !product.sellerId
      ) {
        // Nếu không tìm thấy sản phẩm hoặc không có options
        return callback(null, { inStock: -1, _id: null, sellerId: null });
      }
      const matchingOption = product.options[0];
      // Trả về số lượng hàng trong kho cho option khớp
      callback(null, {
        inStock: matchingOption.inStock,
        _id: matchingOption._id.toString(), //optionId
        sellerId: product.sellerId,
      });
    } catch (error) {
      console.error("System error:", error);

      // Nếu có lỗi xảy ra, trả về -1
      callback(null, { inStock: -1, _id: null, sellerId: null });
    }
  },
  GetPartOfProductInfo: async (call, callback) => {
    const { optionId } = call.request;
    console.log("Get Part Info for product with:", { optionId });

    try {
      const product = await Product.findOne(
        { "options._id": optionId },
        {
          name: 1,
          promotionImage: 1,
          "options.$": 1,
        }
      );

      if (!product) {
        // Nếu không tìm thấy sản phẩm hoặc không có options
        return callback(null, { error: "not found" });
      }
      const option = product.options[0];
      callback(null, {
        productName: product.name,
        price: option.price,
        promotionImage: option.image ? option.image : product.promotionImage,
        value1:
          option.value1 && option.value1 !== "undefined" ? option.value1 : "",
        value2:
          option.value2 && option.value2 !== "undefined" ? option.value2 : "",
      });
    } catch (error) {
      console.error("System error:", error);
      // Nếu có lỗi xảy ra, trả về -1
      callback(null, { error: "system err" });
    }
  },
  GetDetailsProductInfo: async (call, callback) => {
    const { optionId } = call.request;
    console.log("Get Details Info for product with:", { optionId });

    try {
      const product = await Product.findOne(
        { "options._id": optionId },
        {
          name: 1,
          promotionImage: 1,
          "options.$": 1,
        }
      );

      if (!product) {
        // Nếu không tìm thấy sản phẩm hoặc không có options
        return callback(null, { error: "not found" });
      }
      const option = product.options[0];
      callback(null, {
        productName: product.name,
        price: option.price,
        promotionImage: option.image ? option.image : product.promotionImage,
        type1: option.type1 ? option.type1 : "",
        type2: option.type2 ? option.type2 : "",
        value1:
          option.value1 && option.value1 !== "undefined" ? option.value1 : "",
        value2:
          option.value2 && option.value2 !== "undefined" ? option.value2 : "",
        inStock: option.inStock || 0,
      });
    } catch (error) {
      console.error("System error:", error);
      // Nếu có lỗi xảy ra, trả về -1
      callback(null, { error: "system err" });
    }
  },
  CheckProductInventory: async (call, callback) => {
    try {
      const { items } = call.request;
      const outOfStockItems = [];

      // Check từng item
      for (const item of items) {
        const product = await Product.findOne(
          { "options._id": item.optionId },
          { "options.$": 1 }
        );

        if (!product || !product.options[0]) {
          outOfStockItems.push({
            productId: item.productId,
            optionId: item.optionId,
            availableQuantity: 0,
          });
          continue;
        }

        const option = product.options[0];
        if (option.inStock < item.quantity) {
          outOfStockItems.push({
            productId: item.productId,
            optionId: item.optionId,
            availableQuantity: option.inStock,
          });
        }
      }

      callback(null, {
        success: outOfStockItems.length === 0,
        outOfStockItems,
      });
    } catch (error) {
      console.error("Error checking inventory:", error);
      callback(null, {
        success: false,
        outOfStockItems: [],
      });
    }
  },
  UpdateProductInventory: async (call, callback) => {
    const { productId, optionId, quantity } = call.request;
    console.log("Update inventory for product with:", {
      productId,
      optionId,
      quantity,
    });

    try {
      // Kiểm tra strict hơn cho input parameters
      if (
        !productId ||
        !optionId ||
        !quantity ||
        productId.trim() === "" ||
        optionId.trim() === ""
      ) {
        console.error("Invalid or empty input parameters:", {
          productId,
          optionId,
          quantity,
        });
        callback(null, { success: false });
        return;
      }

      // Validate ObjectId format
      if (
        !mongoose.Types.ObjectId.isValid(productId) ||
        !mongoose.Types.ObjectId.isValid(optionId)
      ) {
        console.error("Invalid ObjectId format:", { productId, optionId });
        callback(null, { success: false });
        return;
      }

      // Convert string to ObjectId để chắc chắn
      const productObjectId =
        mongoose.Types.ObjectId.createFromHexString(productId);
      const optionObjectId =
        mongoose.Types.ObjectId.createFromHexString(optionId);

      // Tìm sản phẩm và cập nhật
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: productObjectId,
          "options._id": optionObjectId,
        },
        {
          $inc: { "options.$.inStock": -quantity },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedProduct) {
        console.error("Product or option not found");
        callback(null, { success: false });
        return;
      }

      // Kiểm tra số lượng trong kho
      const updatedOption = updatedProduct.options.find(
        (opt) => opt._id.toString() === optionId
      );

      if (updatedOption.inStock < 0) {
        // Hoàn tác nếu số lượng âm
        await Product.findOneAndUpdate(
          {
            _id: productObjectId,
            "options._id": optionObjectId,
          },
          {
            $inc: { "options.$.inStock": quantity },
          }
        );

        callback(null, { success: false });
        return;
      }

      console.log("Successfully updated inventory");
      callback(null, { success: true });
    } catch (error) {
      console.error("Error updating inventory:", error);
      callback(null, { success: false });
    }
  },
});

const startGrpcServer = () => {
  const serverPort = process.env.GRPC_SERVER_PORT || 50052;
  server.bindAsync(
    `0.0.0.0:${serverPort}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error("Failed to start server:", error);
        return;
      }
      console.log(`gRPC server started on port ${port}`);
    }
  );
};

export default startGrpcServer;
