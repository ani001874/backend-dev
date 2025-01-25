import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import {
    deleteFromCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudnary.js";
import { User } from "../model/user.model.js";
import ApiResponse from "../utils/apiResponse.js";

const generateAccessTokenAndRefreshToken = async (userId) => {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, fullName, password } = req.body;

    if (
        [username, email, fullName, password].some(
            (field) => field.trim() === ""
        )
    ) {
        throw new ApiError(401, "All field are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const avatarLocalPath = req.files.avatar[0].path;
    let coverImageLocalPath;
    if (req.files && req.files.coverImage) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(404, "Avatar Local path is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(404, "Avatar path is required");
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage ? coverImage.url : " ",
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    res.status(201).json(
        new ApiResponse(201, createdUser, "User Registered successfullly!!!")
    );
});

const logInUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    console.log(username, password);

    if (!username && !email) {
        throw new ApiError(404, "username or Email is required..");
    }

    const user = await User.findOne({ $or: [{ email }, { username }] });
    // chek user is registered or not
    if (!user) {
        throw new ApiError(401, "User is not registered..");
    }

    // check passoword

    const isCorrectPassword = await user.checkPassword(password);

    if (!isCorrectPassword) {
        throw (400, "Password is incorrect Please try again");
    }

    const { accessToken, refreshToken } =
        await generateAccessTokenAndRefreshToken(user._id);

    const options = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: {
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                },
                accessToken,
                refreshToken,
            })
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out!!"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    let incommingRefreshToken =
        req.body.refreshToken || req.cookies.refreshToken;

    if (!incommingRefreshToken) {
        throw new ApiError(401, "Unauthorized Access");
    }

    try {
        let decodeToken = jwt.verify(
            incommingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
        let user = await User.findById(decodeToken?._id);
        if (!user) {
            throw new ApiError(404, "Invalid Refresh Token!!");
        }

        if (user?.refreshToken !== incommingRefreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, refreshToken } =
            await generateAccessTokenAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: refreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const changePassword = asyncHandler(async (req, res) => {
    let { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new ApiError(404, "Old password or new Password are required");
    }

    try {
        const user = await User.findById(req.user._id);
        let isOldPasswordCorrect = await user.checkPassword(oldPassword);

        if (!isOldPasswordCorrect) {
            throw new ApiError(401, "Your password is incorrect !!!");
        }

        user.password = newPassword;
        await user.save({ validateBeforeSave: false });
        res.status(200).json(
            new ApiResponse(200, {}, "password changed successfully...")
        );
    } catch (error) {
        console.log(error);
        throw new ApiError(500, error?.message);
    }
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;
    if (!fullName && !email) {
        throw new ApiError(404, "fullName or new Password are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                ...(fullName && { fullName }),
                ...(email && { email }),
            },
        },
        {
            new: true,
        }
    ).select("-password -refreshToken");

    res.status(200).json(new ApiResponse(200, user));
});

const updateAvatar = asyncHandler(async (req, res) => {
    // console.log(req.files)
    let avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(404, "New Avatar is required to update..");
    }

    const user = await User.findById(req.user._id);

    // Delete Exists avatar file

    let existedAvatarFile = await User.findById(req.user._id, {
        _id: 0,
        avatar: 1,
    });
    let publicId = existedAvatarFile.avatar.split("/").pop().split(".")[0];

    console.log(publicId);

    let isRemoved = await deleteFromCloudinary([publicId]);

    if (!isRemoved) {
        throw new ApiError(500, "Exists file does not removed!!!");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
        throw new ApiError(
            404,
            "Error occoured while uploading on cloudinary..."
        );
    }

    user.avatar = avatar?.path;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(
        new ApiResponse(200, {}, "Avatar Updated successfully")
    );
});

const updateCoverImage = asyncHandler(async (req, res) => {
    let coverImageLoacalPath = req.file?.path;

    if (!coverImageLoacalPath) {
        throw new ApiError(404, "New CoverIamge  is required to update..");
    }

    const user = await User.findById(req.user._id);

    // Delete Exists avatar file

    let existedCoverImageFile = await User.findById(req.user?._id, {
        _id: 0,
        coverImage: 1,
    });
    let publicId = existedCoverImageFile?.coverImage
        .split("/")
        .pop()
        .split(".")[0];

    let isRemoved = await deleteFromCloudinary([publicId]);

    if (!isRemoved) {
        throw new ApiError(500, "Exists coverImage  file does not removed!!!");
    }

    const coverImage = await uploadOnCloudinary(coverImageLoacalPath);

    if (!coverImage) {
        throw new ApiError(
            404,
            "Error occoured while uploading CoverImage on cloudinary..."
        );
    }

    user.coverImage = coverImage?.path;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(
        new ApiResponse(200, {}, "CoverImage Updated successfully")
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscriber",
            },
        },

        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscriberedTo",
            },
        },

        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscriber",
                },
                channelSubscribedToCount: {
                    $size: "$subscriberedTo",
                },

                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscriber.subscriber"] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                fullName: 1,
                email: 1,
                username: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
            },
        },
    ]);

    res.status(200).json(new ApiResponse(200, channel));
});

export {
    registerUser,
    logInUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    getUserChannelProfile,
};
