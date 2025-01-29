import { Router } from "express";
import verifyJWT from "../middleware/auth.middleware.js";
import { getLikedVideos, toggleCommentLike, toggleVideoLike } from "../controllers/like.controller.js";


const likeRouter = Router()

likeRouter.use(verifyJWT)

likeRouter.route('/liked-videos').get(getLikedVideos)
likeRouter.route('/comments/:commentId').post(toggleCommentLike)
likeRouter.route('/video/:videoId').post(toggleVideoLike)


export default likeRouter

