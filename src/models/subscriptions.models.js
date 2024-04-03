import  mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
    {
        subscribers: {
            type: mongoose.Schema.Types.ObjectId, // one who's subscribing
            ref: "User"
        },
        channel: {
            type: mongoose.Schema.Types.ObjectId, // one to whom 'subscriber' is subscribing
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);


export const Subscription = new mongoose.model("Subscription", subscriptionSchema);