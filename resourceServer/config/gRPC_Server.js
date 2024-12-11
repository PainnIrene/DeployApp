import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";
import {
  uploadFileToS3,
  deleteFileFromS3,
  uploadProductImagesToS3,
} from "../src/utils/aws.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROTO_PATH = path.join(__dirname, "../proto/Resource.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const resourceServiceProto =
  grpc.loadPackageDefinition(packageDefinition).resourceService;

const server = new grpc.Server();

server.addService(resourceServiceProto.ResourceService.service, {
  UploadSingleFile: async (call, callback) => {
    const { userId, bucketName, bucketFolder, image, fileExtension } =
      call.request;
    if (!image || image.length === 0) {
      return callback(new Error("Invalid file provided"), null);
    }

    try {
      const uploadedFileUrl = await uploadFileToS3(
        bucketName,
        bucketFolder,
        userId,
        image,
        fileExtension
      );
      callback(null, { url: uploadedFileUrl, success: true });
    } catch (error) {
      console.error("Upload to S3 failed:", error);
      callback(error, null);
    }
  },
  DeleteSingleFile: async (call, callback) => {
    const { url, bucketName } = call.request;
    if (!url || !bucketName) {
      return callback(new Err("Invalid url/bucketName"), null);
    }
    try {
      await deleteFileFromS3(bucketName, url);
      callback(null, { success: true });
    } catch (err) {
      console.error("Delete File Failed", err);
      callback(err, null);
    }
  },
  UploadProductImages: async (call, callback) => {
    const {
      userId,
      productId,
      bucketName,
      bucketFolder,
      promotionImage,
      productImages,
      optionImages,
    } = call.request;
    console.log("INFO: Receive upload product image request:");
    console.log("Promotion Image: ", promotionImage ? 1 : 0);
    console.log("Product Image: ", productImages.length);
    console.log("Options Product Image: ", optionImages.length);
    if (userId && bucketName && bucketFolder) {
      try {
        const { promotionImageUrl, productImageUrls, optionImageUrls } =
          await uploadProductImagesToS3(
            userId,
            productId,
            bucketName,
            promotionImage,
            productImages,
            optionImages
          );
        callback(null, {
          promotionImageUrl,
          productImageUrls,
          optionImageUrls,
        });
      } catch (error) {
        console.error("Error in UploadProductImages:", error);
        callback(error);
      }
    } else {
      callback(new Error("Invalid input parameters"));
    }
  },
});

const startGrpcServer = () => {
  const serverPort = process.env.GRPC_SERVER_PORT || 50051;
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
