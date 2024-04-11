import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { required } from "nodemon/lib/config";

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true
        },
        video: {
            types: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        },
        owner: {
            types: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", commentSchema);