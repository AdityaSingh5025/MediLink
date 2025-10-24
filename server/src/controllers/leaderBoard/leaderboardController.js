import Leaderboard from "../../models/Leaderboard.js";
import mongoose from "mongoose";


// Get Top 10 Users on Leaderboard 
export const getLeaderboard = async (req, res) => {
  try {
    const data = await Leaderboard.find()
      .sort({ reputationScore: -1 })
      .limit(10);

    return res.status(200).json({ success: true, data });
  } catch (error) {
  
    console.error("getLeaderboard error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};


//2. Get Current User Leaderboard Stats
// Automatically creates an entry if the user does not exist
export const getUserStats = async (req, res) => {
  try {
    const { id: userId, name } = req.user;

    // Check if the user already exists in the leaderboard
    let user = await Leaderboard.findOne({ userId });

    // If not found, create a new leaderboard record for the user
    if (!user) {
      user = await Leaderboard.create({
        userId,
        name,
        donatedCount: 0,
        reputationScore: 0,
      });
    }

    // If the stored name differs from the current one, update it
    if (user.name !== name) {
      user.name = name;
      await user.save();
    }

    // Calculate the user's rank
    // The rank is based on how many users have a higher reputationScore
    const rank = await Leaderboard.countDocuments({
      reputationScore: { $gt: user.reputationScore },
    });

    // Return user data with computed rank
    res.status(200).json({
      success: true,
      data: { ...user.toObject(), rank: rank + 1 },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// 3. Increment User Donation and Reputation 
export const incrementDonated = async (req, res) => {
  try {
  
    const { id: userId, name } = req.user;

    console.log("Incrementing donation for:", name, userId);

  
    const user = await Leaderboard.findOneAndUpdate(
      { userId: userId },
      {
        $inc: { donatedCount: 1, reputationScore: 5 },
        $set: { name: name || "Anonymous", lastUpdated: new Date() },
      },
      { new: true, upsert: true }
    );

    console.log("Updated leaderboard entry:", user);

   
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("incrementDonated error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
