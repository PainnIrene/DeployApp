import express from "express";
const router = express.Router();
import { resourceClient } from "../../config/gRPC_Client.js";
import multer from "multer";
const upload = multer();
router.post("/test", upload.single("image"), async (req, res) => {
  const userId = "testing"; // Assuming req.user.id contains the current user's id
  const bucketName = "ipain-user";
  const bucketFolder = "user";
  const image = req.file.buffer;
  const fileExtension = "." + req.file.originalname.split(".").pop();
  if (!image || !fileExtension) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  try {
    const uploadRequest = {
      userId,
      bucketName,
      bucketFolder,
      image,
      fileExtension,
    };

    const uploadResponse = await new Promise((resolve, reject) => {
      client.UploadSingleFile(uploadRequest, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });

    if (uploadResponse.success) {
      res.json({ uploadedFileUrl: uploadResponse.url });
    } else {
      res.status(500).json({ error: "File upload failed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "File upload failed" });
  }
});

export default router;
