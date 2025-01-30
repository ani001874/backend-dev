import { Router } from "express";
import verifyJWT from "../middleware/auth.middleware.js";
import {
    addComment,
    deleteComment,
    updateComment,
} from "../controllers/comments.controller.js";

const commentRouter = Router();
commentRouter.use(verifyJWT);

commentRouter
    .route("/:videoId")
    .post(addComment)

commentRouter
    .route("/:commentId")
    .put(updateComment)
    .delete(deleteComment)
   

export default commentRouter;
