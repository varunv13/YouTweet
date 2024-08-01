import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { registerUser } from "./user.controllers.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;

  if (!content || content?.trim() === "") {
    throw new ApiError(400, "Content is required");
  }
  const tweet = await Tweet.create({
    content: content.trim(),
    owner: req.user._id,
  });

  await User.findByIdAndUpdate(req.user._id, { $push: { tweets: tweet._id } });

  if (!tweet)
    throw new ApiError(500, "Something went wrong while creating a tweet");

  return res
    .status(201)
    .json(new ApiResponse(200, tweet, "Tweet created successfullt"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params; // Get userId from request parameters

  // Validate userId
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "User ID is invalid");
  }

  // Check if the user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User doesn't exist");
  }

  // Fetch the user's tweets
  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId), // Match tweets by owner ID
      },
    },
    {
      $lookup: {
        from: "users", // The user collection is named 'users'
        localField: "owner", // Field in Tweet schema that references the user
        foreignField: "_id", // Field in User schema
        as: "ownerInfo", // Output array field for the owner information
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$ownerInfo",
        preserveNullAndEmptyArrays: true, // Optional: Preserve tweets without owners
      },
    },
  ]);

  // Check if the user has any tweets
  if (tweets.length === 0) {
    return res.status(200).json({
      status: 200,
      message: "No tweets found for this user",
      data: [],
    });
  }

  // Return the user's tweets
  return res.status(200).json({
    status: 200,
    message: "Fetching all the tweets of the user was successful",
    data: tweets, // Return the array of tweets
  });
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update
  const { tweetId } = req.params;
  const { content } = req.body;
  const { id } = req.user;

  if (!isValidObjectId(tweetId)) throw new ApiError(401, "Tweet is in-valid");

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) throw new ApiError(400, "Tweet does not exist");

  if (tweet.owner.toString() !== id.toString()) {
    throw new ApiError(500, "You're not authorized to edit this tweet");
  }

  tweet.content = content;
  await tweet.save();
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet has been updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  const { id } = req.user;

  if (!isValidObjectId(tweetId)) throw new ApiError(400, "Tweet is in-valid");

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) throw new ApiError(400, "Tweet does not exist");

  if (tweet.owner.toString() !== id.toString()) {
    throw new ApiError(500, "You're not authorized to delete the tweet");
  }

  await Tweet.findOneAndDelete(tweet);
  return res
    .status(201)
    .json(new ApiResponse(200, tweet, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
