import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.models.js";
import { Video } from "../models/video.models.js";
import { Tweet } from "../models/tweet.models.js";

// Todo:
// To work on the total likes on the tweets, videos, and comments,
// on videos -> the user can see who are the other users who have liked the video
// on tweets -> the user can see who are the other users who have liked the tweet
// overall -> the user can see total no of likes the tweet, video and comment have

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { id } = req.user;
  //TODO: toggle like on video
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid Comment ID");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(400, "Video does not exist!!");

  const videoLiked = await Like.findOne({
    video: videoId,
    likedBy: id,
  });

  if (videoLiked) {
    const disLikeVideo = await Like.findOneAndDelete({
      video: videoId,
      likedBy: id,
    });

    if (!disLikeVideo) throw new ApiError(400, "Failed to dis-like the video.");

    return res
      .status(200)
      .json(
        new ApiResponse(200, disLikeVideo, "Video dis-liked successfully."),
      );
  } else {
    const likeVideo = await Like.create({
      video: videoId,
      likedBy: id,
    });

    if (!likeVideo) throw new ApiError(400, "Failed to like to the video.");

    return res
      .status(200)
      .json(new ApiResponse(200, likeVideo, "Video liked successfully."));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { id } = req.user;

  //TODO: toggle like on comment
  if (!isValidObjectId(commentId))
    throw new ApiError(400, "Comment Id is in-valid.");

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(400, "Comment does not exist");

  const commentLiked = await Like.findOne({
    comment: commentId,
    likedBy: id,
  });

  if (commentLiked) {
    const disLike = await Like.findOneAndDelete({
      likedBy: id,
      comment: commentId,
    });

    if (!disLike) throw new ApiError(400, "Failed to dislike the comment.");
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          disLike,
          "User dis-liked the comment successfully",
        ),
      );
  } else {
    const like = await Like.create({
      comment: commentId,
      likedBy: id,
    });

    if (!like) throw new ApiError(400, "Faile to like the comment!!");

    return res
      .status(200)
      .json(new ApiResponse(200, like, "User liked the comment successfully"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { id } = req.user;
  //TODO: toggle like on tweet
  if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid Tweet Id.");

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) throw new ApiError(404, "Tweet does not exist");

  const tweetLiked = await Like.findOne({
    likedBy: id,
    tweet: tweetId,
  });

  if (tweetLiked) {
    const disLikeTweet = await Like.findOneAndDelete({
      likedBy: id,
      tweet: tweetId,
    });

    if (!disLikeTweet) throw new ApiError(500, "Failed to dislike the tweet.");

    return res
      .status(200)
      .json(new ApiResponse(200, disLikeTweet, "Tweet disliked successfully."));
  } else {
    const likeTweet = await Like.create({
      tweet: tweetId,
      likedBy: id,
    });

    if (!likeTweet) throw new ApiError(500, "Failed to like the tweet.");

    return res
      .status(200)
      .json(new ApiResponse(200, likeTweet, "Tweet Liked successfully."));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const { id } = req.user;

  if (!isValidObjectId(id)) throw new ApiError(400, "user ID is invalid");

  const videosLikedByUser = await Like.find({
    video: { $ne: null },
    likedBy: id,
  })
    .populate("video", "title thumbnail")
    .exec();

  if (videosLikedByUser.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, videosLikedByUser, "No liked-videos found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        videosLikedByUser,
        "Fetched all liked videos of the user sucessfully",
      ),
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
