import dotenv from "dotenv";
dotenv.config();
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
const s3Config = {
  region: "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key,
  },
};

let s3Client = null;

const getS3Client = () => {
  if (!s3Client) {
    s3Client = new S3Client(s3Config);
    console.log("Create Client");
  }
  return s3Client;
};
const testS3Connection = async () => {
  const client = getS3Client();
  try {
    const data = await client.send(new ListBucketsCommand({}));
    console.log("Connection to S3 successful!");
    console.log(
      "Buckets:",
      data.Buckets.map((bucket) => bucket.Name)
    );
  } catch (err) {
    console.error("Error connecting to S3:", err);
  }
};

export { getS3Client, testS3Connection };
