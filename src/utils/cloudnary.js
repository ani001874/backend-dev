import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    secure:true
});

// upload on cloudinary

export const uploadOnCloudinary = async (filePath) => {
    try {
        if (!filePath) return null;
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto",
        });

        return uploadResult;
    } catch (error) {
        fs.unlinkSync(filePath); // remove the locally saved temporary file as the upload operation got failed
        console.log(error);
        return null;
    }
};

export const deleteFromCloudinary = async (publicId) => {
    try {
        let response = await cloudinary.api.delete_resources(publicId, {
            type: "upload",
            resource_type: "image",
        });
    
        return response
    } catch (error) {
        console.log(error)
    }
};
