import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RESOURCE_PROTO_PATH = path.join(__dirname, "../proto/Resource.proto");
const PRODUCT_PROTO_PATH = path.join(__dirname, "../proto/Product.proto");

const packageDefinition = protoLoader.loadSync(RESOURCE_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const resourceServiceProto =
  grpc.loadPackageDefinition(packageDefinition).resourceService;

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

const resourceClient = new resourceServiceProto.ResourceService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

const productClient = new productServiceProto.ProductService(
  "localhost:50052",
  grpc.credentials.createInsecure()
);

export { resourceClient, productClient };
