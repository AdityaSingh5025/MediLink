import mongoose from "mongoose";
import Chat from "../../models/Chat.js";

//GET ALL CHATS FOR LOGGED-IN USER (SIDEBAR)
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id.toString();

    // Find all chats where this user is a participant
    const chats = await Chat.find({ participants: userId })
      .populate("listingId", "title photoURL")
      .populate("participants", "name email avatar")
      .sort({ updatedAt: -1 });

    // If no chats are found, return an empty array
    if (!chats.length) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No chats found.",
      });
    }
    // Format chat data for sidebar display
    const formattedChats = chats.map((chat) => {
      // Identify the "other" user in the chat (not the logged-in one)
      const otherUser = chat.participants.find(
        (p) => p._id.toString() !== userId
      );

      // Retrieve the most recent message from chat
      const lastMessage =
        chat.messages?.length > 0
          ? chat.messages[chat.messages.length - 1]
          : null;

      // Return simplified chat data for UI display
      return {
        chatId: chat._id,
        listingId: chat.listingId?._id,
        listingTitle: chat.listingId?.title || "Untitled Listing",
        participantName: otherUser?.name || "Unknown",
        participantId: otherUser?._id.toString(),
        avatar: otherUser?.avatar || "",
        lastMessage: lastMessage?.text || "No messages yet",
        updatedAt: chat.updatedAt,
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedChats,
    });
  } catch (error) {
    console.error(" Error fetching user chats:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch user chats",
    });
  }
};

// GET CHAT HISTORY FOR A SPECIFIC LISTING
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id.toString();
    const { listingId } = req.params;

    // Find the chat where this user participated for the given listing
    const chat = await Chat.findOne({
      listingId: listingId,
      participants: userId,
    }).populate("messages.senderId", "_id name");
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "No chats available for this listing.",
      });
    }

    // Normalize messages for frontend compatibility
    const normalizedMessages = chat.messages.map((msg) => ({
      _id: msg._id,
      senderId:
        typeof msg.senderId === "object"
          ? msg.senderId._id.toString()
          : msg.senderId,
      text: msg.text,
      timestamp: msg.timestamp,
    }));

    return res.status(200).json({
      success: true,
      message: "Messages fetched successfully.",
      data: normalizedMessages,
    });
  } catch (error) {
    console.error(" Error fetching chat history:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch messages",
    });
  }
};
