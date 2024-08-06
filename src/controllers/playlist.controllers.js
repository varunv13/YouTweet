import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
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
    name,
    description,
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
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
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
