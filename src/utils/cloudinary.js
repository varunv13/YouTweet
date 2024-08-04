import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded succesfully
    // console.log("File is uploaded on cloudinay", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // removes the locally saved temp. files as the upload operation gets failed
    return null;
  }
};

const deleteOnCloudinary = async (publicId, assetType) => {
  try {
    if (!publicId) return null;
    let resourceType;
    switch (assetType) {
      case "image":
        resourceType = "image";
        break;
      case "video":
        resourceType = "video";
        break;
      default:
        throw new Error("Invalid asset type");
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });

    // console.log("Delete Result:", result);
    return result;
  } catch (error) {
    // console.log('Error deleting asset from Cloudinary:', error);
    return null;
  }
};

export { uploadOnCloudinary, deleteOnCloudinary };
