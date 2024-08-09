import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscriptions.models.js";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const { _id } = req.user;
  if (!isValidObjectId(_id)) throw new ApiError(400, "Invalid User Id");

  //total number of videos
  const totalVideos = await Video.countDocuments({ owner: _id });

  //total number of subscribers
  const totalSubscribers = await Subscription.countDocuments({ channel: _id });

  //total number of likes
  // Fetch total number of likes across all videos
  const totalLikes = await Like.countDocuments({
    video: { $in: await Video.find({ owner: _id }).distinct("_id") },
  });

  //total number of views across all videos
  const totalViews = await Video.aggregate([
    { $match: { owner: _id } },
    { $group: { _id: null, totalViews: { $sum: "$views" } } },
  ]);

  const stats = {
    totalVideos,
    totalSubscribers,
    totalLikes,
    totalViews: totalViews[0]?.totalViews || 0,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Channel stats fetched successfully!!"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  if (!isValidObjectId(_id)) throw new ApiError(400, "Invalid User Id!!");

  const videos = await Video.aggregate([
    {
      $match: {
        owner: _id, //filter videos to include only those uploaded by the user
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "likedBy",
              foreignField: "_id",
              as: "userDetails",
            },
          },
          {
            $project: {
              _id: 0,
              userName: "$userDetails.fullName",
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
        likedByUserNames: {
          $map: { input: "$likes", as: "like", in: "$$like.userName" },
        },
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "userDetails",
            },
          },
          {
            $project: {
              _id: 0,
              userDetails: {
                $arrayElemAt: ["$userDetails", 0],
              },
            },
          },
          {
            $project: {
              userName: "$userDetails.fullName",
              avatar: "$userDetails.avatar",
            },
          },
        ],
      },
    },
    {
      $addFields: {
        commentCounts: { $size: "$comments" },
        commentedByUsers: {
          $map: {
            input: "$comments",
            as: "comment",
            in: {
              userName: "$$comment.userName",
              avatar: "$$comment.avatar",
            },
          },
        },
      },
    },
    {
      $project: {
        likes: 0, // Exclude the likes array
        comments: 0, // Exclude the comments array
      },
    },
  ]);

  if (videos.length === 0) {
    return res.status(200).json(new ApiResponse(200, videos, "No video found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        videos,
        "Videos uploaded by channel fetched successfully!!",
      ),
    );
});

export { getChannelStats, getChannelVideos };
