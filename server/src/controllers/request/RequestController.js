import Request from "../../models/Request.js";
import Listing from "../../models/Listing.js";
import Chat from "../../models/Chat.js";
import mongoose from "mongoose";
import Leaderboard from "../../models/Leaderboard.js";

// Socket Integration
let ioInstance = null;

export const registerSocket = (io) => {
  ioInstance = io;
  // console.log("Socket instance registered for requests");
};

// Create a New Request
export const createRequest = async (req, res) => {
  try {

    const { listingId } = req.params; 
    const { prescriptionDoc, message } = req.body; 
    const requesterId = req.user.id;

    // console.log("Creating request:", { listingId, requesterId, message }); 

    if (!requesterId) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized: no authenticated user" 
      });
    }

    if (!listingId || !mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({ 
        success: false,
        message: "Valid listing ID is required" 
      });
    }

    // Check if listing exists
    const existingList = await Listing.findById(listingId);
    if (!existingList) {
      return res.status(404).json({ 
        success: false,
        message: "Listing not found" 
      });
    }

    if (existingList.status !== "available") {
      return res.status(400).json({
        success: false,
        message: `Listing is ${existingList.status}, not available for requests`
      });
    }

    const ownerId = existingList.ownerId;

    // Prevent owner from requesting their own listing
    if (ownerId.toString() === requesterId.toString()) {
      return res.status(400).json({ 
        success: false,
        message: "Cannot request your own listing" 
      });
    }

    const existingRequest = await Request.findOne({
      listingId,
      requesterId,
      status: { $in: ["pending", "approved", "awaiting_confirmation"] }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: `You already have a ${existingRequest.status} request for this listing`
      });
    }

    // For medicine, require prescription
    if (existingList.type === "medicine" && !prescriptionDoc) {
      return res.status(400).json({ 
        success: false,
        message: "Prescription document is required for medicine listings" 
      });
    }

    const requestObject = {
      listingId,
      requesterId,
      ownerId,
      message: message?.trim() || "",
    };

    if (existingList.type === "medicine") {
      requestObject.prescriptionDoc = prescriptionDoc;
    }

    // Create request
    const request = await Request.create(requestObject);

    await request.populate([
      { path: "listingId", select: "title type photoURL" },
      { path: "requesterId", select: "name email" },
      { path: "ownerId", select: "name email" }
    ]);

    console.log("Request created successfully:", request); 

    return res.status(201).json({
      success: true,
      message: "Request created successfully",
      request: request, 
    });
  } catch (error) {
    console.error("Create request error:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: "You already have an active request for this listing" 
      });
    }

    return res.status(500).json({ 
      success: false,
      message: "Failed to create request",
      error: error.message
    });
  }
};

// Get My Requests (Owner or Requester)
export const getMyrequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { role, status } = req.query;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    let filter = {};

    // Filter based on role
    if (role === "owner") {
      filter.ownerId = userId;
    } else if (role === "requester") {
      filter.requesterId = userId;
    } else {
      filter.$or = [{ ownerId: userId }, { requesterId: userId }];
    }

    if (status && ["pending", "approved", "awaiting_confirmation", "completed", "rejected", "cancelled"].includes(status)) {
      filter.status = status;
    }

    const requests = await Request.find(filter)
      .populate("listingId", "title type photoURL status location") 
      .populate("ownerId", "name email avatar") 
      .populate("requesterId", "name email avatar")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Requests fetched successfully",
      count: requests.length,
      requests: requests, 
    });
  } catch (error) {
    console.error("Get my requests error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch requests",
      error: error.message
    });
  }
};

// Get Requests for a Specific Listing Owner only
export const getRequestForListing = async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user.id;

    if (!listingId || !mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({ 
        success: false,
        message: "Valid listing ID is required" 
      });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ 
        success: false,
        message: "Listing not found" 
      });
    }

    if (listing.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view requests for this listing"
      });
    }

    const requests = await Request.find({ listingId })
      .populate("requesterId", "name email avatar")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: requests.length ? "Requests fetched successfully" : "No requests found",
      count: requests.length,
      requests: requests, 
    });
  } catch (error) {
    console.error("Get requests for listing error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to fetch requests",
      error: error.message 
    });
  }
};

// Approve a Request
export const approveRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ 
        success: false,
        message: "Valid request ID is required" 
      });
    }

    const request = await Request.findById(requestId)
      .populate("listingId", "title type photoURL")
      .populate("requesterId", "name email")
      .populate("ownerId", "name email");

    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: "Request not found" 
      });
    }

    // Only owner can approve
    if (request.ownerId._id.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to approve this request" 
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot approve request with status: ${request.status}`
      });
    }

    // Update status
    request.status = "approved";
    await request.save();

    // Create or find chat
    let chat = await Chat.findOne({ 
      listingId: request.listingId._id,
      participants: { $all: [request.ownerId._id, request.requesterId._id] }
    });

    if (!chat) {
      chat = await Chat.create({
        listingId: request.listingId._id,
        participants: [request.ownerId._id, request.requesterId._id],
        messages: [],
      });
    }

    await Listing.findByIdAndUpdate(request.listingId._id, {
      status: "reserved"
    });

    return res.status(200).json({
      success: true,
      message: "Request approved successfully",
      request: request, 
      chatId: chat._id
    });
  } catch (error) {
    console.error("Approve request error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to approve request",
      error: error.message 
    });
  }
};

// Cancel a Request by requester
export const cancelRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ 
        success: false,
        message: "Valid request ID is required" 
      });
    }

    const request = await Request.findById(requestId)
      .populate("listingId", "title type photoURL")
      .populate("requesterId", "name email")
      .populate("ownerId", "name email");

    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: "Request not found" 
      });
    }

    // Only requester can cancel
    if (request.requesterId._id.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to cancel this request" 
      });
    }

    if (!["pending", "approved"].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel request with status: ${request.status}`
      });
    }

    // If approved, revert listing status
    if (request.status === "approved") {
      await Listing.findByIdAndUpdate(request.listingId._id, {
        status: "available"
      });
    }

    request.status = "cancelled";
    await request.save();

    return res.status(200).json({
      success: true,
      message: "Request cancelled successfully",
      request: request 
    });
  } catch (error) {
    console.error("Cancel request error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to cancel request",
      error: error.message 
    });
  }
};

// Reject a Request by owner
export const rejectRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ 
        success: false,
        message: "Valid request ID is required" 
      });
    }

    const request = await Request.findById(requestId)
      .populate("listingId", "title type photoURL")
      .populate("requesterId", "name email")
      .populate("ownerId", "name email");

    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: "Request not found" 
      });
    }

    // Only owner can reject
    if (request.ownerId._id.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false,
        message: "Not authorized to reject this request" 
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot reject request with status: ${request.status}`
      });
    }

    request.status = "rejected";
    await request.save();

    return res.status(200).json({
      success: true,
      message: "Request rejected successfully",
      request: request 
    });
  } catch (error) {
    console.error("Reject request error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to reject request",
      error: error.message 
    });
  }
};

// Mark as Donated by owner
export const markAsDonated = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ 
        success: false,
        message: "Valid request ID is required" 
      });
    }

    const request = await Request.findById(requestId)
      .populate("requesterId", "name email")
      .populate("ownerId", "name email")
      .populate("listingId", "title type photoURL");

    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: "Request not found" 
      });
    }

    // Only owner can mark as donated
    if (request.ownerId._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to mark as donated",
      });
    }

    if (request.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved requests can be marked as donated",
      });
    }

    request.status = "awaiting_confirmation";
    await request.save();

    // Ensure chat exists
    let chat = await Chat.findOne({ 
      listingId: request.listingId._id,
      participants: { $all: [request.ownerId._id, request.requesterId._id] }
    });
    
    if (!chat) {
      chat = await Chat.create({
        listingId: request.listingId._id,
        participants: [request.ownerId._id, request.requesterId._id],
        messages: [],
      });
    }

    // Add system message
    const messageText = `${request.ownerId.name} has marked the donation for "${request.listingId.title}" as sent. Please confirm once received.`;

    const message = {
      senderId: request.ownerId._id,
      text: messageText,
      timestamp: new Date(),
    };

    chat.messages.push(message);
    await chat.save();

    if (ioInstance) {
      ioInstance
        .to(request.listingId._id.toString())
        .emit("receiveMessage", message);
    }

    return res.status(200).json({
      success: true,
      message: "Donation marked as sent, awaiting confirmation",
      request: request, 
    });
  } catch (error) {
    console.error("Mark as donated error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to mark as donated",
      error: error.message 
    });
  }
};

// Complete Request by requester - confirms receipt
export const completeRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false,
        message: "Valid request ID is required" 
      });
    }

    const request = await Request.findById(requestId)
      .populate("listingId", "title type photoURL")
      .populate("requesterId", "name email")
      .populate("ownerId", "name email")
      .session(session);

    if (!request) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false,
        message: "Request not found" 
      });
    }

    // Only requester can confirm
    if (request.requesterId._id.toString() !== userId.toString()) {
      await session.abortTransaction();
      return res.status(403).json({ 
        success: false,
        message: "Only recipient can confirm donation" 
      });
    }

    if (request.status !== "awaiting_confirmation") {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false,
        message: "Donation not awaiting confirmation" 
      });
    }

    // Mark as completed
    request.status = "completed";
    await request.save({ session });

    // Update listing to donated
    await Listing.findByIdAndUpdate(
      request.listingId._id,
      { status: "donated" },
      { session }
    );

    // Update leaderboard
    await Leaderboard.findOneAndUpdate(
      { userId: request.ownerId._id },
      {
        $inc: { donatedCount: 1, reputationScore: 5 },
        $set: { lastUpdated: new Date() },
      },
      { upsert: true, new: true, session }
    );

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Donation confirmed successfully",
      request: request, // Changed from 'data'
    });
  } catch (error) {
    await session.abortTransaction();
    // console.error("Complete request error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to complete request",
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};