import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_PATH = path.join(__dirname, "../../proto/Resource.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const resourceServiceProto =
  grpc.loadPackageDefinition(packageDefinition).resourceService;

const client = new resourceServiceProto.ResourceService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

export default client;
