import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], //[ownerId, requesterId]
  messages: [messageSchema]
}, { timestamps: true });

export default  mongoose.model("Chat", chatSchema);
