import { Router } from "express";
import {
    changePassword,
    getCurrentUser,
    getUserChannelProfile,
    logInUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import verifyJWT from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerUser
);

router.route("/login").post(logInUser);

// secured route

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changePassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-details").patch(verifyJWT, updateAccountDetails);
router
    .route("/update-avatar")
    .patch( verifyJWT,upload.single("avatar"),updateAvatar);
router
    .route("/update-coverImage")
    .patch( verifyJWT, upload.single("coverImage"),updateCoverImage);


router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
export default router;




