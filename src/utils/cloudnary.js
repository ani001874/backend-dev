import {v2 as cloudinary} from "cloudinary"
import fs from 'fs'



    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.CLOUD_API_KEY, 
        api_secret: process.env.CLOUD_API_SECRET
    })


// upload on cloudinary

export const uploadOnCloudinary = async(filePath) => {
    try {
        if(!filePath) return null
         const uploadResult = await cloudinary.uploader.upload(filePath, {
            resource_type:'auto'
         })
         console.log("File uploaded successfullly...", uploadResult);
         
        } catch (error) {
        
    }
}