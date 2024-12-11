import { resourceClient } from "../../config/gRPC_Client.js";
const uploadSingleFile = async (
  userId,
  bucketName,
  bucketFolder,
  file,
  fileExtension
) => {
  if (!file || !fileExtension) {
    throw new Error("No file uploaded");
  }
  try {
    const uploadRequest = {
      userId,
      bucketName,
      bucketFolder,
      image: file,
      fileExtension,
    };

    const uploadResponse = await new Promise((resolve, reject) => {
      resourceClient.UploadSingleFile(uploadRequest, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });

    if (uploadResponse.success) {
      return uploadResponse.url;
    } else {
      return "";
    }
  } catch (error) {
    console.error(error);
    return "";
  }
};
const deleteSingleFile = async (bucketName, url) => {
  try {
    const deleteRequest = {
      bucketName,
      url,
    };
    const deleteSingleFileResponse = await new Promise((resolve, reject) => {
      resourceClient.DeleteSingleFile(deleteRequest, (err, response) => {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
    if (deleteSingleFileResponse.success) {
      return deleteSingleFileResponse.success;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return "";
  }
};

export { uploadSingleFile, deleteSingleFile };
