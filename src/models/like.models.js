import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        video: {
            types: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        },
        comment: {
            types: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        },
        tweet: {
            types: mongoose.Schema.Types.ObjectId,
            ref: "Tweet"
        },
        likedBy: {
            types: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

export const Like = mongoose.model("Like", likeSchema);