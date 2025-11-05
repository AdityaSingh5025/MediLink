import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  label: { 
    type: String, 
    enum: ["home", "work", "other"],
    default: "other"
  },
  street: { type: String, trim: true, default: "" },
  city: { 
    type: String, 
    required: [true, "City is required"],
    trim: true 
  },
  state: { type: String, trim: true, default: "" },
  country: { type: String, trim: true, default: "" },
  postalCode: { type: String, trim: true, default: "" }
}, { _id: true });

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    
    dateOfBirth: {
      type: Date,
      default: null
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      lowercase: true,
      default: null
    },
    
    contactNumber: {
      type: String,
      trim: true,
      default: null
    },
    
    profilePicture: {
      type: String,
      default: null
    },

    addresses: {
      type: [addressSchema],
      default: []
    }
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);