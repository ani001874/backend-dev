import { User } from "../model/user.model.js";
import { Subscription } from "../model/subscription.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { mongo } from "mongoose";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    let owner = await User.findById(channelId).select(
        " -password -refreshToken "
    );

    if (!owner) {
        return res.status(404).json(new ApiError(404, "Channel not found"));
    }

    const channel = await Subscription.findOne({
        $and: [{ channel: owner }, { subscriber: req.user }],
    });

    if (!channel) {
        const newChannel = await Subscription.create({
            channel: owner,
            subscriber: req.user,
        });
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    newChannel,
                    "Successfully subscribed to channel"
                )
            );
    } else {
        await channel.deleteOne();

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    null,
                    "Successfully unsubscribed from channel"
                )
            );
    }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    try {
        const subscribers = await Subscription.find(
            {
                channel: channelId,
            },
            { createdAt: 0, updatedAt: 0, __v: 0, _id: 0, channel: 0 }
        ).populate("subscriber", "fullName usrname avatar");

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    subscribers,
                    "List of subscribers fetched successfully"
                )
            );
    } catch (error) {
        console.log(error);
        return res.status(500).json(new ApiError(500, error.message));
    }
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    try {
        const channels = await Subscription.find(
            {
                subscriber: subscriberId,
            },
            { createdAt: 0, updatedAt: 0, __v: 0, _id: 0, subscriber: 0 }
        ).populate("channel", "fullName usrname avatar");

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    channels,
                    "List of subscribed channels fetched successfully"
                )
            );
    } catch (error) {
        console.log(error);
        return res.status(500).json(new ApiError(500, error.message));
    }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
