import { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const id = req.user._id;

  //TODO: create playlist
  if ([name, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const existedPlaylist = await Playlist.findOne({
    $or: [{ name }, { description }],
  });

  if (existedPlaylist)
    throw new ApiError(400, "Playlist with this name already exist");

  const newPlayList = await Playlist.create({
    name: name.trim(),
    description: description.trim(),
    owner: id,
  });

  if (!newPlayList)
    throw new ApiError(400, "Playlist can not be created successfully");

  return res
    .status(201)
    .json(new ApiResponse(201, newPlayList, "Playlist created successfully!!"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!isValidObjectId(userId)) throw new ApiError(400, "User ID is in-valid");

  const owner = await Playlist.findOne({ owner: userId });
  if (!owner) throw new ApiError(400, "User does not exist");

  const playlists = await Playlist.find({ owner: userId })
    .populate("videos", "thumbnail")
    .exec();
  if (!playlists.length) throw new ApiError(400, "No playlist found");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlists,
        "Playlists of the user feteched successfully.",
      ),
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  //TODO: get playlist by id
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Playlist ID is not valid");

  const playList = await Playlist.findById(playlistId);
  if (!playList) throw new ApiError(400, "Playlist does not exist!!");

  return res
    .status(200)
    .json(new ApiResponse(200, playList, "Playlist feteched successfully."));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const { id } = req.user._id;

  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Playlist Id does not exist.");
  if (!isValidObjectId(videoId))
    throw new ApiError(400, "Video Id does not exist.");

  const playList = await Playlist.findById(playlistId);
  if (!playList) throw new ApiError(400, "Playlist does not exist.");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(400, "Video does not exist.");

  if (playList.owner.id.toString() !== id.toString()) {
    throw new ApiError(400, "You're not authorized to make any changes");
  }

  if (playList.videos.includes(videoId)) {
    throw new ApiError(400, "Video already exist with-in the playlist");
  }

  const videoAdded = await Playlist.findByIdAndUpdate(
    playlistId,
    { $push: { videos: videoId } },
    { new: true },
  );
  // console.log(videoAdded);
  if (!videoAdded)
    throw new ApiError(
      400,
      "Something went wrong while adding the video to the playlist.",
    );

  return res
    .status(400)
    .json(
      new ApiResponse(
        400,
        videoAdded,
        "Video added to the playlist successfully.",
      ),
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const { id } = req.user._id;

  // TODO: remove video from playlist
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Playlist ID not valid");
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Video ID not valid");

  const playList = await Playlist.findById(playlistId);
  if (!playList) throw new ApiError(404, "PlayList does not exist.");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video does not exist.");

  if (playList.owner.id.toString() !== id.toString()) {
    throw new ApiError(400, "You're not authorized to make any changes");
  }

  if (!playList.videos.includes(videoId)) {
    throw new ApiError(400, "Video does not exist with-in the playlist");
  }

  const videoRemoved = await Playlist.findByIdAndUpdate(
    playlistId,
    { $pull: { videos: videoId } },
    { new: true },
  );

  if (!videoRemoved)
    throw new ApiError(
      400,
      videoRemoved,
      "Something went wrong while removing the video from the playlist.",
    );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        videoId,
        "Video removed from the playlist successfully.",
      ),
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Playlist ID is not valid");

  const playList = await Playlist.findById(playlistId);
  if (!playList) throw new ApiError(400, "Playlist does not exist");

  const deletedPlaylist = await Playlist.findOneAndDelete(playList);
  if (!deletedPlaylist) throw new ApiError(400, "Something went wrong");

  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully."),
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Playlist Id is invalid!!");

  const playList = await Playlist.findById(playlistId);
  if (!playList) throw new ApiError(400, "Playlist does not exist!!");

  if (name?.trim() === "" && description?.trim() === "")
    throw new ApiError(400, "Enter the field which you want to update");

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      name: name?.trim() || playList.name,
      description: description?.trim() || playList.description,
    },
    { new: true },
  );

  if (!updatedPlaylist)
    throw new ApiError(
      400,
      "Something went wrong while updating the playlist.",
    );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Playlist updated successfully."),
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
