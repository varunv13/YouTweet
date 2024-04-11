import { type } from "express/lib/response";
import mongoose, { Schema } from "mongoose";
import { required } from "nodemon/lib/config";

const playlistSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        videos: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Videos"
            }
        ],
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

export const Playlist = mongoose.model("Playlist", playlistSchema);