import { Router } from "express";
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js";
import verifyJWT from "../middleware/auth.middleware.js";

const subscriptionRouter = Router();

subscriptionRouter.use(verifyJWT);
subscriptionRouter
    .route("/:channelId")
    .post(toggleSubscription)
    .get(getUserChannelSubscribers);

subscriptionRouter
    .route("/channel/:subscriberId")
    .get(getSubscribedChannels);

export default subscriptionRouter;
