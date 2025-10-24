import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  prescriptionDoc: { type: String, default: null },

  message: { type: String, default: "" },
  status: {
    type: String,
    enum: [
      "pending",
      "approved",
      "awaiting_confirmation",
      "completed",
      "rejected",
      "cancelled",
    ],
    default: "pending",
  },

  createdAt: { type: Date, default: Date.now },

  updatedAt: { type: Date, default: Date.now },

  expiresAt: { type: Date, default: null },
});


RequestSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Prevent multiple pending requests for the same listing from the same requester
RequestSchema.index(
  { listingId: 1, requesterId: 1, status: 1 },
  {
    partialFilterExpression: {
      status: { $in: ["pending", "approved", "completed"] },
    },
    unique: true,
  }
);

// Export the Request model for use in controllers
export default mongoose.model("Request", RequestSchema);
