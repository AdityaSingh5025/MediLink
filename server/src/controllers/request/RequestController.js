import Request from "../../models/Request.js";
import Listing from "../../models/Listing.js";
import Chat from "../../models/Chat.js";
import mongoose from "mongoose";
import Leaderboard from "../../models/Leaderboard.js";
//Socket Integration
let ioInstance = null;
// Register socket instance from server
export const registerSocket = (io) => {
  ioInstance = io;
};

// Create a New Request
export const createRequest = async (req, res) => {
  try {
    const listingId = req.params.listingId;
    const requesterId = req.user.id;

    // Ensure user is authenticated
    if (!requesterId) {
      return res
        .status(401)
        .json({ error: "Unauthorized: no authenticated user" });
    }

    const { prescriptionDoc, message } = req.body;

    // Check if the listing exists
    const existingList = await Listing.findById(listingId);
    if (!existingList) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const ownerId = existingList.ownerId;

    // Prevent the owner from creating a request on their own listing
    if (String(ownerId) === requesterId) {
      return res
        .status(400)
        .json({ error: "Owner cannot create a request on their own listing" });
    }

    // For medicine listings, ensure a prescription document is provided
    if (existingList.type === "medicine" && !prescriptionDoc) {
      return res
        .status(400)
        .json({ error: "prescriptionDoc is required for medicine listings" });
    }

    const requestObject = {
      listingId,
      requesterId,
      ownerId,
      message: message || "",
    };

    // Add prescription document if required
    if (existingList.type === "medicine") {
      requestObject.prescriptionDoc = prescriptionDoc;
    }

    // Create a new request
    const request = await Request.create(requestObject);

    return res.status(201).json({
      success: true,
      message: "Request created successfully",
      request,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


// Get My Requests (Owner or Requester)
export const getMyrequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { role } = req.query;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing user ID" });
    }

    let filter = {};

    // Filter requests based on user role
    if (role === "owner") {
      filter = { ownerId: userId };
    } else {
      filter = { requesterId: userId };
    }

    // Fetch all requests for the user
    const requests = await Request.find(filter)
      .populate("listingId ownerId requesterId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Requests fetched successfully",
      requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch requests",
    });
  }
};


// this is for admin -  Get Requests for a Specific Listing
export const getRequestForListing = async (req, res) => {
  try {
    const { listingId } = req.params;

    if (!listingId) {
      return res.status(400).json({ message: "please provide listing id" });
    }

    // Fetch all requests related to the given listing
    const requests = await Request.find({ listingId });

    if (!requests || requests.length === 0) {
      return res.status(400).json({ message: "no request available" });
    }

    return res.status(200).json({
      success: true,
      message: "request fetched successfully",
      requests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//Approve a Request
export const approveRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    const getRequest = await Request.findById(requestId);

    // Ensure only the listing owner can approve
    if (String(getRequest.ownerId) !== String(userId)) {
      return res.status(400).json({ message: "not authorised" });
    }

    // Update the request status
    getRequest.status = "approved";
    await getRequest.save();

    // Create or find an existing chat between owner and requester
    const chat = await Chat.findOneAndUpdate(
      { listingId: getRequest.listingId },
      {
        $setOnInsert: {
          listingId: getRequest.listingId,
          participants: [getRequest.ownerId, getRequest.requesterId],
          messages: [],
        },
      },
      { upsert: true, new: true }
    );

    return res
      .status(200)
      .json({ message: "request approved", request: getRequest, chat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Cancel a Request 
export const cancelRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    const getRequest = await Request.findById(requestId);

    // Only requester can cancel the request
    if (String(getRequest.requesterId) !== String(userId)) {
      return res.status(400).json({ message: "not authorised" });
    }

    getRequest.status = "cancelled";
    await getRequest.save();

    return res
      .status(200)
      .json({ message: "request cancelled", request: getRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//Reject a Request
export const rejectRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    const getRequest = await Request.findById(requestId);

    // Only owner can reject
    if (String(getRequest.ownerId) !== String(userId)) {
      return res.status(400).json({ message: "not authorised" });
    }

    getRequest.status = "rejected";
    await getRequest.save();

    return res
      .status(200)
      .json({ message: "request rejected", request: getRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//Confirm Completion of Donation 
export const completeRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    const getRequest = await Request.findById(requestId);
    if (!getRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Only requester can confirm the donation
    if (String(getRequest.requesterId) !== String(userId)) {
      return res.status(403).json({ message: "Only recipient can confirm donation" });
    }

    // Check if request is in correct status
    if (getRequest.status !== "awaiting_confirmation") {
      return res.status(400).json({ message: "Donation not awaiting confirmation" });
    }

    // Mark request as completed
    getRequest.status = "completed";
    await getRequest.save();

    // Update listing status to donated
    await Listing.findByIdAndUpdate(getRequest.listingId, {
      status: "donated",
    });

    // Update leaderboard for donor
    await Leaderboard.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(getRequest.ownerId) },
      {
        $inc: { donatedCount: 1, reputationScore: 5 },
        $set: { lastUpdated: new Date() },
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Donation confirmed successfully and listing marked as donated.",
      request: getRequest,
    });
  } catch (error) {
    console.error("completeRequest error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

//Mark Donation as Sent by Owner
export const markAsDonated = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    const request = await Request.findById(requestId)
      .populate("requesterId")
      .populate("ownerId")
      .populate("listingId");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Only owner can mark as donated
    if (String(request.ownerId._id) !== String(userId)) {
      return res
        .status(403)
        .json({ message: "Not authorized to mark as donated" });
    }

    // Only approved requests can be marked as donated
    if (request.status !== "approved") {
      return res
        .status(400)
        .json({ message: "Only approved requests can be marked as donated" });
    }

    request.status = "awaiting_confirmation";
    await request.save();

    // Ensure chat exists for communication
    let chat = await Chat.findOne({ listingId: request.listingId });
    if (!chat) {
      chat = await Chat.create({
        listingId: request.listingId,
        participants: [request.ownerId, request.requesterId],
        messages: [],
      });
    }

    // Add a system message about the donation
    const messageText = `${request.ownerId.name} has marked the donation for "${request.listingId.title}" as sent.`;

    const message = {
      senderId: request.ownerId._id,
      text: messageText,
      messageType: "system",
      timestamp: new Date(),
    };

    chat.messages.push(message);
    await chat.save();

    // Emit message through socket if available
    if (ioInstance) {
      ioInstance
        .to(request.listingId._id.toString())
        .emit("receiveMessage", message);
    }

    return res.status(200).json({
      success: true,
      message: "Donation marked as sent and awaiting confirmation.",
      request,
    });
  } catch (error) {
    console.error("markAsDonated error:", error);
    return res.status(500).json({ message: error.message, stack: error.stack });
  }
};
