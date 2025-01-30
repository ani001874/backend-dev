import { Router } from "express";
import verifyJWT from "../middleware/auth.middleware.js";
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    updateThumbnail,
    getAllCommentsOnVideo,
} from "../controllers/video.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const videoRouter = Router();

videoRouter.use(verifyJWT);

videoRouter
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            { name: "videoFile", maxCount: 1 },
            { name: "thumbnail", maxCount: 1 },
        ]),
        publishAVideo
    );

videoRouter
    .route("/:videoId")
    .get(getVideoById)
    .put(updateVideo)
    .patch(upload.single("thumbnail"),updateThumbnail)
    .delete(deleteVideo);


videoRouter.route('/all-comments/:videoId').get(getAllCommentsOnVideo)

export default videoRouter;
