import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
// TODO: will add a property "comment" which will be array, such that it will store comments of the same and different users
const videoSchema = new Schema(
  {
    videoFile: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    thumbnail: {
      public_id: {
        type: String,
      },
      Url: {
        type: String,
      },
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
