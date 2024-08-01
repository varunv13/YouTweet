import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscriptions.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Channel Id is not valid");
  }

  // if it's a channel, then it'll also be a user
  const channel = await User.findById({ _id: channelId });
  if (!channel) throw new ApiError(404, "Channel does not exist!!");

  const userSubscribed = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user._id,
  });

  if (userSubscribed) {
    const unsubscribe = await Subscription.findOneAndDelete({
      subscriber: req.user._id,
      channel: channelId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          unsubscribe,
          "User unsubscribed to the channel successfully",
        ),
      );
  } else {
    const subscribe = await Subscription.create({
      channel: channelId,
      subscriber: req.user._id,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subscribe,
          "User subscribed to the channel successfully",
        ),
      );
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId))
    throw new ApiError(400, "Channel ID is invalid");

  const channel = await User.findById({ _id: channelId });
  if (!channel) throw new ApiError(400, "Channel does not exist!!");

  const subscribers = await Subscription
  .find({ channel: channelId })
  .populate(
    "subscriber",
    "username avatar",
  )
  .exec();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribers,
        "Fetched all the subscribers of the channel sucessfully",
      ),
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
