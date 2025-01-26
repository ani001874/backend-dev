import Video from "../model/video.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    deleteFromCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudnary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    //TODO: get all videos based on query, sort, pagination

    const allVideos = await Video.find();

    if (!allVideos) {
        throw new ApiError(500, "Server Error!! Video files does not appear..");
    }

    res.status(200).json(
        new ApiResponse(200, allVideos, "Video fetched successfully")
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    // TODO: get video, upload to cloudinary, create video

    if (!title || !description) {
        throw new ApiError(404, "title or description not found !!");
    }

    const localVideFile = req.files?.videoFile[0].path;
    const localThumbnailFile = req.files?.thumbnail[0].path;

    if (!localVideFile || !localThumbnailFile) {
        throw new ApiError(404, "local video file or thumbnail is missing");
    }

    const videoFile = await uploadOnCloudinary(localVideFile);
    const thumbnail = await uploadOnCloudinary(localThumbnailFile);

    if (!videoFile || !thumbnail) {
        throw new ApiError(
            400,
            "problem occoured while uploading on cloudinary "
        );
    }

    console.log(videoFile);

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        owner: req.user,
    });

    res.status(201).json(
        new ApiResponse(201, video, "New video uploaded successfully..")
    );
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    console.log(videoId);
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(500, "Something went wrong to countinue the video ");
    }

    res.status(200).json(new ApiResponse(200, video));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: update video details like title, description,

    const { title, description } = req.body;
    if (!(title || description)) {
        throw new ApiError(400, "title, description and thumbnail is missing");
    }

    console.log(title, description);

    let video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                ...(title && { title }),
                ...(description && { description }),
            },
        },
        {
            new: true,
          
        }
    );

 

    res.status(200).json(
        new ApiResponse(
            200,
            video,
            "video title or description is updated successfully"
        )
    );
});

const updateThumbnail = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
     console.log(req.file);
     
    const localThumbnailFile = req.file?.path;
    if (!localThumbnailFile) {
        throw new ApiError(400, "thumbnail file is missing");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "video not found");
    }

    const oldThumbnailId = video.thumbnail.split("/").pop().split(".")[0];

    if (oldThumbnailId) {
        await deleteFromCloudinary(oldThumbnailId, "image");
    }

    const thumbnail = await uploadOnCloudinary(localThumbnailFile);
    if (!thumbnail) {
        throw new ApiError(
            400,
            "problem occoured while uploading on cloudinary "
        );
    }

    video.thumbnail = thumbnail.url;
    await video.save({ validateBeforeSave: false });
    res.status(200).json(
        new ApiResponse(200, video, "thumbnail updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: delete video
    // search video by videoId
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "video not found");
    }
    // First delete thumbnail from cloudinary
    const thumbnailPublicId = video.thumbnail.split("/").pop().split(".")[0];
    if (thumbnailPublicId) {
        await deleteFromCloudinary(thumbnailPublicId, "image");
    }
    // then delete video from cloudinary

    const videoPublicId = video.videoFile.split("/").pop().split(".")[0];
    if (videoPublicId) {
        await deleteFromCloudinary(videoPublicId, "video");
    }

    await video.deleteOne();
    res.status(200).json(
        new ApiResponse(200, {}, "video deleted successfully")
    );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    updateThumbnail,
    deleteVideo,
};
