import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const {
    page = 1,
    limit = 2,
    sortBy = "createdAt",
    sortType = "desc",
  } = req.query;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video id.");

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  const queryObject = {};
  queryObject[sortBy] = sortType === "asc" ? 1 : -1;

  const comments = await Comment.find({ video: videoId })
    .populate("owner", "id avatar")
    .sort(queryObject)
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber);

  if (comments.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, comments, "No comment found"));
  }

  const totalComments = await Comment.countDocuments();
  const totalPages = Math.ceil(totalComments / limit);
  const remainingPages = totalPages - page;

  const pagination = {
    currentPage: page,
    totalPages: totalPages,
    remainingPages: remainingPages,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        comments,
        "Comments fetched Successfully!",
        pagination,
      ),
    );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;
  const id = req.user._id;

  if (!isValidObjectId(videoId)) throw new ApiError(400, "In-valid video id.");
  if (!isValidObjectId(id)) throw new ApiError(400, "Invalid user id");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video does not exist!!");

  if (content?.trim() === "")
    throw new ApiError(400, "Content of the comment not provided.");

  const comment = await Comment.create({
    content: content?.trim(),
    video: videoId,
    owner: id,
  });

  if (!comment)
    throw new ApiError(400, "Something went wrong while posting a comment.");

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment created successfully."));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { id } = req.user._id;
  const { content } = req.body;

  if (!isValidObjectId(commentId))
    throw new ApiError(400, "In-valid comment id");

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment does not exist on the video.");

  if (comment.owner.id.toString() !== id.toString()) {
    throw new ApiError(400, "You are not authorized to make any changes.");
  }

  if (content?.trim() === "")
    throw new ApiError(404, "Content of the comment not provided.");

  const updatedComment = await Comment.findOneAndUpdate(
    comment,
    { content: content?.trim() },
    { new: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  const { id } = req.user._id;

  if (!isValidObjectId(commentId))
    throw new ApiError(400, "In-valid comment id");

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment does not exist on the video.");

  if (comment.owner.id.toString() !== id.toString()) {
    throw new ApiError(400, "You are not authorized to make any changes.");
  }

  const commentDeleted = await Comment.findOneAndDelete(comment);
  if (!commentDeleted)
    throw new ApiError(
      400,
      "Something went wrong while deleteing the comment.",
    );

  return res
    .status(200)
    .json(
      new ApiResponse(200, commentDeleted, "Comment deleted successfully."),
    );
});

export { getVideoComments, addComment, updateComment, deleteComment };
