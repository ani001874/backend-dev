import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";

import { uploadOnCloudinary } from "../utils/cloudnary.js";
import {User} from '../model/user.model.js'
import ApiResponse from "../utils/apiResponse.js"; 





const generateAccessTokenAndRefreshToken = async (userId) => {
     const user = await User.findById(userId)
     const accessToken =  user.generateAccessToken()
     const refreshToken  =   user.generateRefreshToken()
     user.refreshToken = refreshToken
    await  user.save({validateBeforeSave:false})
    return {accessToken,refreshToken}
}

const registerUser = asyncHandler(async(req,res) => {

    const {username,email,fullName,password} = req.body;

    if([username,email,fullName,password].some(field => field.trim() === '')) {
        throw new ApiError(401,"All field are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files.avatar[0].path
    let coverImageLocalPath
    if(req.files && req.files.coverImage) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath) {
        throw new ApiError(404,"Avatar Local path is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar) {
        throw new ApiError(404,"Avatar path is required")
    }

    const user = await User.create({
        username:username.toLowerCase(),
        email,
        password,
        fullName,
        avatar: avatar.url,
        coverImage:coverImage ? coverImage.url : " "
    })


    const createdUser = await User.findById(user._id).select("-password -refreshToken")
   
    res.status(201).json(
        new ApiResponse(201,createdUser,"User Registered successfullly!!!")
    )
})


const logInUser = asyncHandler(async(req,res) => {

    const {username,email,password} = req.body;
    console.log(username,password)
    
    if(!username && !email) {
        throw new ApiError(404,"username or Email is required..")
    }

      const user =  await User.findOne({$or:[{email},{username}]})
     // chek user is registered or not
      if(!user) {
        throw new ApiError(401,"User is not registered..")
      }

      // check passoword

      const isCorrectPassword =  await user.checkPassword(password)

      if(!isCorrectPassword) {
        throw(400,"Password is incorrect Please try again")
      }


      const {accessToken,refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

       const options = {
        httpOnly:true,
        secure:true
       }


       res
       .status(200)
       .cookie("accessToken",accessToken,options)
       .cookie("refreshToken",refreshToken,options)
       .json(
        new ApiResponse(
            200,
            {
                user:{
                    username:user.username,
                    email:user.email,
                    fullName:user.fullName
                },
                accessToken,
                refreshToken
            }
        )
       )

})



const logOutUser = () => {

}


export {registerUser, logInUser,logOutUser}