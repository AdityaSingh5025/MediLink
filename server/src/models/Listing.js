import mongoose from "mongoose";

const ListingSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner ID is required"],
    },

    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    type: {
      type: String,
      enum: {
        values: ["medicine", "equipment"],
      },
      required: [true, "Type is required"],
    },

    photoURL: {
      type: String,
      default: null,
    },

    expiryDate: {
      type: Date,
      validate: {
        validator: function (v) {
          if (this.type !== "medicine") return true;
          return !v || v > new Date();
        },
        message: "Expiry date must be in the future for medicine",
      },
    },

    location: {
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      lat: {
        type: Number,
        min: -90,
        max: 90,
        default: null,
      },
      lng: {
        type: Number,
        min: -180,
        max: 180,
        default: null,
      },
    },
    status: {
      type: String,
      enum: {
        values: ["available", "reserved", "donated"],
        message: "{VALUE} is not a valid status",
      },
      default: "available",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

ListingSchema.index({ ownerId: 1 });
ListingSchema.index({ type: 1, status: 1 });
ListingSchema.index({ "location.city": 1 });
ListingSchema.index({ status: 1, createdAt: -1 });
ListingSchema.index({ expiryDate: 1 }); // For medicine queries

//  Auto-update status for expired medicines
ListingSchema.pre("save", function (next) {
  if (
    this.type === "medicine" &&
    this.expiryDate &&
    this.expiryDate <= new Date()
  ) {
    this.status = "donated"; // Or "expired" - add to enum if needed
  }
  next();
});

export default mongoose.model("Listing", ListingSchema);
