import express from "express";
import dotenv from "dotenv";
dotenv.config();
import multer from "multer";
import { testS3Connection } from "./config/s3Client.js";
import { uploadFileToS3, deleteFileFromS3 } from "./src/utils/aws.js";
import startGrpcServer from "./config/gRPC_Server.js";
const PORT = process.env.PORT || 3004;
const app = express();
const upload = multer();

app.get("/", (req, res) => {
  res.send("Hoang tran").status(200);
});
app.post("/", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    console.log(file);
    const bucketName = "ipain-user";
    const bucketFolder = "user";
    const userId = "hoangtran123";
    const fileUrl = await uploadFileToS3(
      bucketName,
      bucketFolder,
      userId,
      file
    );

    res.json({ fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload file" });
  }
});
app.get("/delete", (req, res) => {
  const bucketName = "ipain-user";
  const filePath =
    "user/hoangtran123/c1a2bc3f-38e7-47c1-9b45-be77abb96b03-2024619-21922.png";

  deleteFileFromS3(bucketName, filePath)
    .then(() => {
      console.log("File deleted successfully");
    })
    .catch((err) => {
      console.error("Error deleting file:", err);
    });
});
app.listen(PORT, async () => {
  console.log("Server is running on port:", PORT);
  await testS3Connection();
  startGrpcServer();
});
