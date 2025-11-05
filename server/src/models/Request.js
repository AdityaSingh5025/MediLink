import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: [true, "Listing ID is required"],
      index: true,
    },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Requester ID is required"],
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner ID is required"],
      index: true,
    },
    prescriptionDoc: {
      type: String,
      default: null,
    },
    message: {
      type: String,
      default: "",
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: {
        values: [
          "pending",
          "approved",
          "awaiting_confirmation",
          "completed",
          "rejected",
          "cancelled",
        ],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
      index: true,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

RequestSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

RequestSchema.index({ listingId: 1, requesterId: 1 });
RequestSchema.index({ ownerId: 1, status: 1 });
RequestSchema.index({ requesterId: 1, status: 1 });
RequestSchema.index({ createdAt: -1 });

RequestSchema.index(
  { listingId: 1, requesterId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending", "approved", "awaiting_confirmation"] },
    },
    name: "unique_active_request",
  }
);

export default mongoose.model("Request", RequestSchema);
