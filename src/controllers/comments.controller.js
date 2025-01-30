import { Comment } from "../model/commets.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    // get the video id from the request params
    const { videoId } = req.params;
    // get the comment from the request body
    const { comment } = req.body;
    if (comment.trim() === "") {
        throw new ApiError(404, "Comments is missing");
    }
    try {
        // create a new comment
        const newComment = await Comment.create({
            comment,
            video: videoId,
            owner: req.user._id,
        })

       console.log(newComment.owner.username);
        // return the new comment
        return res
            .status(201)
            .json(
                new ApiResponse(201,newComment, "Comment added successfully")
            );
    } catch (error) {
        console.log(error);
        return res.status(500).json(new ApiError(500, error.message));
    }
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { comment } = req.body;
    const existingComment = await Comment.findById(commentId);

    if (!existingComment) {
        throw new ApiError(404, "Comments is missing");
    }

    if (existingComment.owner._id.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "Unauthorized access: You do not own this comment"
        );
    }

    existingComment.comment = comment;
    await existingComment.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                existingComment,
                "Commets is updated successfully"
            )
        );
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (comment.owner._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized Request");
    }

    await comment.deleteOne();
    return res
        .status(200)
        .json(new ApiResponse(200, null, "Comment deleted successfully"));
});

export { addComment, updateComment, deleteComment };
