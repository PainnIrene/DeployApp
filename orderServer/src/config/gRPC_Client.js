import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PRODUCT_PROTO_PATH = path.join(__dirname, "../../proto/Product.proto");
const CART_PROTO_PATH = path.join(__dirname, "../../proto/Cart.proto");
const productPackageDefinition = protoLoader.loadSync(PRODUCT_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const productServiceProto = grpc.loadPackageDefinition(
  productPackageDefinition
).productService;

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

const productClient = new productServiceProto.ProductService(
  "localhost:50052",
  grpc.credentials.createInsecure()
);

const cartClient = new cartServiceProto.CartService(
  "localhost:50053",
  grpc.credentials.createInsecure()
);

export { productClient, cartClient };
