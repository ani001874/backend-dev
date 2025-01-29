import { Like } from "../model/like.model.js";
import ApiResponse from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const isVideoLiked = await Like.findOne({
        video: videoId,
        likedBy: req.user._id,
    });

    if (isVideoLiked) {
        await isVideoLiked.deleteOne();
        return res.status(200).json(new ApiResponse(200, {}, "Video Unliked"));
    } else {
        await Like.create({ video: videoId, likedBy: req.user._id });
        return res.status(200).json(new ApiResponse(200, {}, "Video Liked"));
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const isCommentLiked = await Like.findByIdAndDelete({
        _id: commentId,
        likedBy: req.user._id,
    });

    if (isCommentLiked) {
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Comment is Unliked"));
    } else {
        await Like.create({ comment: commentId, likedBy: req.user._id });
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Comment is Liked"));
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.find({ likedBy: req.user._id })
        .populate({
            path: "video",
            select: "title description", // Specify the fields you want to show
            populate: {
                path: "owner",
                model: "User",
                select: "username email -_id",
            },
        })
        .populate({
            path: "likedBy",
            model: "User",
            select: "username email -_id",
        });
    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked Videos"));
});

export { toggleVideoLike, toggleCommentLike, getLikedVideos };
