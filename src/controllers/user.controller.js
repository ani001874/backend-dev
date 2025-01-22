import ApiError from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../model/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import ApiResponse from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // get data from frontend
    // validation - not empty
    // check user already exiests by username or email
    //check for image , check for avatar
    //upload them cloudinary
    //

    const { username, email, password, fullName } = req.body;

    if (
        [username, email, password, fullName].some(
            (field) => field.trim() === ""
        )
    ) {
        throw new ApiError(400, "All field are required!!!");
    }

    const exiestsUser = User.findOne({ $or: [{ username }, { email }] });

    if (exiestsUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    let avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required..");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required..");
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password,
        fullName,
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );


    res.status(201).json(
        new ApiResponse(201,createdUser,"User Registered Successfully...")
    )
});

export { registerUser };
