import { type } from "express/lib/response";
import mongoose, { Schema } from "mongoose";
import { required } from "nodemon/lib/config";

const tweetSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

export const Tweet = mongoose.model("Tweet", tweetSchema);
