import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const owner = req.user._id;

  // TODO: get video, upload to cloudinary, create video
  if (!title || title?.trim() === "") {
    throw new ApiError(400, "Title not found");
  }

  if (!description || description?.trim() === "") {
    throw new ApiError(400, "Description not found");
  }

  let videoLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.videoFile) &&
    req.files.videoFile[0]
  ) {
    videoLocalPath = req.files.videoFile[0].path;
  }

  let thumbnailLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.thumbnail) &&
    req.files.thumbnail[0]
  ) {
    thumbnailLocalPath = req.files.thumbnail[0].path;
  }

  if (!videoLocalPath) {
    throw new ApiError(400, "Video file required!!");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail file required!!");
  }
  
  const videoUploaded = await uploadOnCloudinary(videoLocalPath);
  const thumbnailUploaded = await uploadOnCloudinary(thumbnailLocalPath);  

  const video = await Video.create({
    videoUploaded: {
      public_id: videoUploaded.public_id,
      url: videoUploaded.url,
    },
    thumbnailUploaded: {
      public_id: thumbnailUploaded.public_id,
      Url: thumbnailUploaded.url,
    },
    title,
    description,
    duration: videoUploaded?.duration,
    isPublished: true,
    owner,
  });

  if (!video) {
    throw new ApiError(400, "Something went wrong");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Uploaded succesfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
