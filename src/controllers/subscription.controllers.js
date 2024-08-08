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

    if(!unsubscribe) throw new ApiError(400, "Something went wrong!!");

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

  // I am the content creator and a channel owner as well as a user, I want to know who have subscribed to me
  // for that i will go the the subscription data base and first find myself there,
  // after finding myself, i will get more details of the subscribers who have subscribed to me
  // by using populate()
  const subscribers = await Subscription.find({ channel: channelId })
    .populate("subscriber", "username avatar")
    .exec();

  const allSubscribers = subscribers.map((subscriber) => ({
    _id: subscriber._id,
    subscriber: {
      _id: subscriber.subscriber._id,
      username: subscriber.subscriber.username,
      avatar: subscriber.subscriber.avatar,
    },
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        allSubscribers,
        "Fetched all the subscribers of the channel sucessfully",
      ),
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId))
    throw new ApiError(400, "Channel ID is in-valid");

  const channel = await User.findById(channelId);
  if (!channel) throw new ApiError(400, "Channel does not exist!!");

  // I am a user and a subscriber, so when i want to see whom i have subscribed to,
  // then i will go to the subscription database and find myself (here, channel._id)
  // and after finding myself, i'll get the additional details of the channel whom i have subscribed to
  // using populate()
  const subscribedTo = await Subscription.find({ subscriber: channel._id })
    .populate("channel", "fullName avatar")
    .exec();

  const subscribedChannels = subscribedTo.map((subscribe) => subscribe.channel);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "Feteched all the channels user has subscribed successfully !!",
      ),
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
