import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";
import Cart from "../src/models/Cart.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CART_PROTO_PATH = path.join(__dirname, "../proto/Cart.proto");

const cartPackageDefinition = protoLoader.loadSync(CART_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const cartServiceProto = grpc.loadPackageDefinition(
  cartPackageDefinition
).cartService;

const server = new grpc.Server();

const startGrpcServer = () => {
  server.addService(cartServiceProto.CartService.service, {
    UpdateCartAfterOrder: async (call, callback) => {
      const { userId, items } = call.request;

      if (!userId || !items || items.length === 0) {
        return callback(new Error("Invalid input parameters"), null);
      }

      try {
        const cart = await Cart.findOne({ userId });

        if (!cart) {
          return callback(new Error("Cart not found"), null);
        }

        const orderItemsMap = new Map(
          items.map((item) => [item.optionId, item.quantity])
        );

        cart.items = cart.items.filter((cartItem) => {
          const orderedQuantity = orderItemsMap.get(cartItem.optionId);

          if (!orderedQuantity) return true;

          if (cartItem.quantity > orderedQuantity) {
            cartItem.quantity -= orderedQuantity;
            return true;
          }

          return false;
        });

        await cart.save();

        callback(null, {
          success: true,
          message: "Cart updated successfully",
        });
      } catch (error) {
        console.error("Error updating cart:", error);
        callback(error, null);
      }
    },
  });

  const serverPort = process.env.GRPC_SERVER_PORT || 50053;
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
