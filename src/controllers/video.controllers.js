import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  //TODO: get all videos based on query, sort, pagination

  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
    title,
  } = req.query;

  // Parse page and limit as integers
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  // Build the sort object
  const validSortFields = ["createdAt", "title", "views", "likes"];
  if (!validSortFields.includes(sortBy)) {
    throw new ApiError(400, `Invalid sortBy field: ${sortBy}`);
  }
  const queryObject = {};
  queryObject[sortBy] = sortType === "asc" ? 1 : -1;

  try {
    const filter = {};
    if (userId) {
      if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User Id");
      }
      filter.owner = userId;
    }

    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    const videos = await Video.find(filter)
      .sort(queryObject)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    if (videos.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, videos, "No video found"));
    }

    const totalVideos = await Video.countDocuments();
    const totalPages = Math.ceil(totalVideos / limit);
    const remainingPages = totalPages - page;

    const pagination = {
      currentPage: page,
      totalPages: totalPages,
      remainingPages: remainingPages,
    };

    return res
      .status(200)
      .json(new ApiResponse(200, videos, "Videos fetched Successfully!", pagination));
  } catch (error) {
    throw new ApiError(500, "An error occurred while fetching videos");
  }
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
    videoFile: {
      public_id: videoUploaded.public_id,
      url: videoUploaded.url,
    },
    thumbnail: {
      public_id: thumbnailUploaded.public_id,
      Url: thumbnailUploaded.url,
    },
    title: title.trim(),
    description: description.trim(),
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

  if (!isValidObjectId(videoId))
    throw new ApiError(400, "Video Id is not valid!!");

  const video = await Video.findById({ _id: videoId });
  if (!video) throw new ApiError(400, "Video doesn't exist!!");

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video feteched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const thumbnailPath = req.file?.path; // path because at first i've to remove the previous thumbnail and while updating the new thumbnail, it requires path
  const { id } = req.user;

  //TODO: update video details like title, description, thumbnail
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "In-valid Video Id!!");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video does not exist!!");
  }

  if (video.owner.toString() !== id) {
    throw new ApiError(400, "You're not authorized to make any changes");
  }

  if (
    !thumbnailPath &&
    (!title || title?.trim === "") &&
    (!description || description?.trim() === "")
  ) {
    throw new ApiError(400, "Please enter the field you want to update");
  }

  if (thumbnailPath) {
    const thumbnailDeleted = await deleteOnCloudinary(
      video.thumbnail.public_id,
      "image",
    );
    if (!thumbnailDeleted) throw new ApiError(400, "Something went wrong!!");

    const thumbnailUpdate = await uploadOnCloudinary(thumbnailPath);
    const updatedThumbail = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          thumbnail: {
            public_id: thumbnailUpdate.public_id,
            Url: thumbnailUpdate.url,
          },
        },
      },
      { new: true },
    );
  }
  if (title) {
    const titleUpdate = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: { title },
      },
      { new: true },
    );
    if (!titleUpdate) throw new ApiError(400, "Something went wrong!!");
  }
  if (description) {
    const descriptionUpdate = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: { description },
      },
      { new: true },
    );

    if (!descriptionUpdate) throw new ApiError(400, "Something went wrong!!");
  }

  const updatedVideo = await Video.findById(videoId);
  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { id } = req.user;
  //TODO: delete video

  if (!isValidObjectId(videoId)) {
    throw new ApiError(200, "Not a valid Video Id!!");
  }

  const video = await Video.findById({ _id: videoId });
  if (!video) throw new ApiError(400, "Video does not exist");

  if (video.owner.toString() !== id) {
    throw new ApiError(400, "You're not authorized to perform this action");
  }

  const videoDeleted = await deleteOnCloudinary(
    video.videoFile.public_id,
    "video",
  );
  if (!videoDeleted) throw new ApiError(400, "Something went wrong!!");

  const thumbnailDeleted = await deleteOnCloudinary(
    video.thumbnail.public_id,
    "image",
  );
  if (!thumbnailDeleted) throw new ApiError(400, "Something went wrong!!");

  await Video.findByIdAndDelete(video);

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video deleted sucessfully"));
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
