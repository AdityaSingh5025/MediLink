import mongoose from "mongoose";
import Chat from "../../models/Chat.js";

// GET ALL CHATS FOR LOGGED-IN USER SIDEBAR
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id.toString();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Find all chats where this user is a participant
    const chats = await Chat.find({ participants: userId })
      .populate("listingId", "title photoURL")
      .populate("participants", "name email")
      .sort({ updatedAt: -1 })
      .lean();

    // If no chats are found, return an empty array
    if (!chats || chats.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No chats found.",
      });
    }

    // Format chat data for sidebar display
    const formattedChats = chats
      .map((chat) => {
        if (!chat.listingId) {
          console.warn(`Chat ${chat._id} has deleted listing`);
          return null;
        }

        if (!chat.participants || chat.participants.length === 0) {
          console.warn(`Chat ${chat._id} has no participants`);
          return null;
        }

        // Identify the "other" user in the chat
        const otherUser = chat.participants.find(
          (p) => p && p._id && p._id.toString() !== userId
        );

        if (!otherUser) {
          console.warn(`Chat ${chat._id} has deleted participant`);
          return null;
        }

        // R most recent message from chat
        const lastMessage =
          chat.messages && chat.messages.length > 0
            ? chat.messages[chat.messages.length - 1]
            : null;

        //  simplified chat data for UI display
        return {
          chatId: chat._id,
          listingId: chat.listingId._id,
          listingTitle: chat.listingId.title || "Untitled Listing",
          listingPhoto: chat.listingId.photoURL || "",
          participantName: otherUser.name || "Unknown User",
          participantId: otherUser._id.toString(),
          avatar: otherUser.avatar || "",
          lastMessage: lastMessage?.text || "No messages yet",
          lastMessageTime: lastMessage?.timestamp || chat.updatedAt,
          updatedAt: chat.updatedAt,
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      data: formattedChats,
    });
  } catch (error) {
    console.error(" Error fetching user chats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user chats",
    });
  }
};

// GET CHAT HISTORY FOR A SPECIFIC LISTING
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id.toString();
    const { listingId } = req.params;

    if (!listingId || !mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing ID format",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // chat where this user participated for the given listing
    const chat = await Chat.findOne({
      listingId: listingId,
      participants: userId,
    })
      .populate("messages.senderId", "_id name")
      .lean();

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "No chat found for this listing.",
      });
    }

    if (!chat.messages || chat.messages.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No messages yet.",
        data: [],
      });
    }

    // Normalize messages for frontend compatibility
    const normalizedMessages = chat.messages
      .map((msg) => {
        if (!msg.senderId) {
          console.warn(`Message ${msg._id} has deleted sender`);
          return {
            _id: msg._id,
            senderId: "deleted-user",
            senderName: "Deleted User",
            text: msg.text,
            timestamp: msg.timestamp,
          };
        }

        return {
          _id: msg._id,
          senderId:
            typeof msg.senderId === "object"
              ? msg.senderId._id.toString()
              : msg.senderId.toString(),
          senderName:
            typeof msg.senderId === "object" ? msg.senderId.name : "Unknown",
          text: msg.text || "",
          timestamp: msg.timestamp,
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      message: "Messages fetched successfully.",
      data: normalizedMessages,
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};
