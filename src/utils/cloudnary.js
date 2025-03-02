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
            use_filename: true,
            unique_filename: false,
            overwrite: true,
        });

        return uploadResult;
    } catch (error) {
        console.log(error);
        return null;
    }finally{
        fs.unlinkSync(filePath)
    }
};

export const deleteFromCloudinary = async (publicId,type) => {
    try {
        let response = await cloudinary.api.delete_resources(publicId, {
            type: "upload",
            resource_type: type,
        });
    
        return response
    } catch (error) {
        console.log(error)
    }
};
