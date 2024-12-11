import { getS3Client } from "../../config/s3Client.js";
import {
  ListObjectsV2Command,
  PutObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { v4 as uuidv4 } from "uuid";
import { extractPathFromUrl } from "./url.js";
import path from "path";
import sharp from "sharp";
const uploadFileToS3 = async (
  bucketName,
  bucketFolder,
  userId,
  file,
  fileExtension
) => {
  const s3Client = getS3Client();
  try {
    console.log("AWS upload request:", {
      bucketName,
      bucketFolder,
      userId,
      file,
      fileExtension,
    });
    // Kiểm tra xem bucket có tồn tại hay không, nếu không thì tạo mới
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    } catch (err) {
      if (err.Code === "NotFound") {
        await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
      } else {
        throw err;
      }
    }

    // Kiểm tra xem bucketFolder có tồn tại hay không, nếu không thì tạo mới
    const bucketFolderKey = `${bucketFolder}/`;
    const bucketFolderExists = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: bucketFolderKey,
        MaxKeys: 1,
      })
    );
    if (!bucketFolderExists.Contents || !bucketFolderExists.Contents.length) {
      await s3Client.send(
        new PutObjectCommand({ Bucket: bucketName, Key: bucketFolderKey })
      );
    }

    // Kiểm tra xem folder cho userId có tồn tại hay không, nếu không thì tạo mới
    const userFolderKey = `${bucketFolderKey}${userId}/`;
    const userFolderExists = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: userFolderKey,
        MaxKeys: 1,
      })
    );
    if (!userFolderExists.Contents || !userFolderExists.Contents.length) {
      await s3Client.send(
        new PutObjectCommand({ Bucket: bucketName, Key: userFolderKey })
      );
    }

    // Tạo tên file duy nhất

    if (file && Buffer.isBuffer(file)) {
      const now = new Date();
      const fileName = `${uuidv4()}-${now.getFullYear()}${
        now.getMonth() + 1
      }${now.getDate()}-${now.getHours()}${now.getMinutes()}${now.getSeconds()}${fileExtension}`;
      const fileKey = `${userFolderKey}${fileName}`;

      const upload = new Upload({
        client: s3Client,
        params: { Bucket: bucketName, Key: fileKey, Body: file },
      });
      const uploadResult = await upload.done();

      const fileUrl = `${bucketFolder}/${userId}/${fileName}`;
      return fileUrl;
    } else return null;
  } catch (err) {
    console.error("Error uploading file to S3:", err);
    throw err;
  }
};
const deleteFileFromS3 = async (bucketName, url) => {
  const s3Client = getS3Client();
  console.log(url);
  const filePath = extractPathFromUrl(url);
  console.log("File Path:", filePath);
  try {
    // Xóa file
    const data = await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: filePath,
      })
    );

    console.log("File deleted successfully", data);
  } catch (err) {
    console.error("Error deleting file:", err);
    throw err;
  }
};
//upload product Image
const uploadProductImagesToS3 = async (
  userId,
  productId,
  bucketName,
  promotionImage,
  productImages,
  optionImages
) => {
  const s3Client = getS3Client();

  try {
    // Định nghĩa các thư mục
    const baseFolder = `product/${userId}/${productId}`;
    const promotionFolder = `${baseFolder}/promotion/`;
    const productImagesFolder = `${baseFolder}/product/`;
    const optionImagesFolder = `${baseFolder}/options/`;

    // Khởi tạo các URL kết quả
    let promotionImageUrl = null;
    const productImageUrls = [];
    const optionImageUrls = [];

    // Khởi tạo cờ để theo dõi thành công hoặc thất bại
    let allUploadsSuccessful = true;

    // Hàm trợ giúp để chuyển đổi hình ảnh sang WebP và tải lên S3
    const convertAndUploadImage = async (buffer, folder) => {
      try {
        const webpBuffer = await sharp(buffer)
          .webp({ quality: 80 }) // Chuyển đổi sang WebP với chất lượng chỉ định
          .toBuffer();

        const fileKey = `${folder}${uuidv4()}-${Date.now()}.webp`;

        await s3Client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: fileKey,
            Body: webpBuffer,
            ContentType: "image/webp",
          })
        );

        // console.log(`Upload successful: ${fileKey}`);
        return fileKey;
      } catch (error) {
        console.error(`Upload failed: ${error.message}`);
        allUploadsSuccessful = false;
        return null;
      }
    };

    // Tải lên hình ảnh khuyến mãi nếu có
    if (promotionImage && Buffer.isBuffer(promotionImage.buffer)) {
      // console.log("Tải lên hình ảnh khuyến mãi...");
      promotionImageUrl = await convertAndUploadImage(
        promotionImage.buffer,
        promotionFolder
      );
    }

    // Tải lên các hình ảnh sản phẩm song song
    // console.log("Tải lên hình ảnh sản phẩm...");
    const productUploadPromises = productImages.map((fileData) =>
      fileData && Buffer.isBuffer(fileData.buffer)
        ? convertAndUploadImage(fileData.buffer, productImagesFolder)
        : null
    );
    const productImageUrlsResult = await Promise.all(productUploadPromises);
    productImageUrls.push(...productImageUrlsResult.filter((url) => url));

    // Tải lên các hình ảnh tùy chọn song song
    // console.log("Tải lên hình ảnh tùy chọn...");
    const optionUploadPromises = optionImages.map((fileData) =>
      fileData && Buffer.isBuffer(fileData.buffer)
        ? convertAndUploadImage(fileData.buffer, optionImagesFolder)
        : null
    );
    const optionImageUrlsResult = await Promise.all(optionUploadPromises);
    optionImageUrls.push(...optionImageUrlsResult.filter((url) => url));

    // Ghi log thành công hoặc thất bại
    if (allUploadsSuccessful) {
      console.log("All Images Upload Successful");
    } else {
      console.log("Images Upload Fail");
    }

    // Trả về các URL
    return {
      promotionImageUrl: promotionImageUrl ? { url: promotionImageUrl } : null,
      productImageUrls: productImageUrls.map((url) => ({ url })),
      optionImageUrls: optionImageUrls.map((url) => ({ url })),
    };
  } catch (err) {
    console.error("Lỗi khi tải lên tệp đến S3:", err);
    throw err;
  }
};

export { uploadFileToS3, deleteFileFromS3, uploadProductImagesToS3 };
