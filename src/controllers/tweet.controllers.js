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

  if (!tweet)
    throw new ApiError(500, "Something went wrong while creating a tweet");

  return res
    .status(201)
    .json(new ApiResponse(200, tweet, "Tweet created successfullt"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
