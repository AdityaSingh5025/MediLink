import mongoose from "mongoose";

const ListingSchema = new mongoose.Schema({

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String
  },
  description: {
    type: String
  },
  type: {
    type: String,
    enum: ["medicine","equipment"]
  },
  photoURL: {
    type: String
  },
  expiryDate: {
    type: Date
  },
  location: {
    city: String, 
    lat: Number,  
    lng: Number
  },
  status: { 
    type: String, 
    enum: ["available", "reserved", "donated"], 
    default: "available" 
  },
  createdAt: { type: Date, default: Date.now } 
});

export default mongoose.model("Listing",ListingSchema)
