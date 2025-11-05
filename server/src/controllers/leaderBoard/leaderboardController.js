import Leaderboard from "../../models/Leaderboard.js";
import User from "../../models/User.js";
import mongoose from "mongoose";

export const getLeaderboard = async (req, res) => {
  try {
    const { page = 1, limit = 10, includeStats = false } = req.query;

    // Validate and sanitize pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Fetch leaderboard and total count
    const [leaderboard, total] = await Promise.all([
      Leaderboard.find()
        .populate("userId", "name email")
        .sort({
          donatedCount: -1,
          createdAt: 1,
        })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Leaderboard.countDocuments(),
    ]);

    // Filter deleted users and format response
    const filteredLeaderboard = leaderboard
      .filter((entry) => entry.userId !== null)
      .map((entry, index) => ({
        rank: skip + index + 1,
        userId: entry.userId?._id,
        name: entry.userId?.name || entry.name || "Deleted User",
        email: entry.userId?.email || null,
        donatedCount: entry.donatedCount,
        lastDonation: entry.lastUpdated,
      }));

    // Base response
    const response = {
      success: true,
      message: "Leaderboard fetched successfully",
      data: filteredLeaderboard,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };

    if (includeStats === "true" || includeStats === true) {
      const [totalDonations, topDonor] = await Promise.all([
        Leaderboard.aggregate([
          { $group: { _id: null, total: { $sum: "$donatedCount" } } },
        ]),
        Leaderboard.findOne()
          .sort({ donatedCount: -1 })
          .populate("userId", "name email")
          .lean(),
      ]);

      response.stats = {
        totalUsers: total,
        totalDonations: totalDonations[0]?.total || 0,
        topDonor: topDonor
          ? {
              userId: topDonor.userId?._id,
              name: topDonor.userId?.name || topDonor.name,
              donatedCount: topDonor.donatedCount,
            }
          : null,
      };
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error(" getLeaderboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch leaderboard",
    });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const { id: userId, name } = req.user;

    // Validate userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // Check if user exists
    const userExists = await User.findById(userId).select("_id name");
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find or create leaderboard entry
    let leaderboardEntry = await Leaderboard.findOne({ userId });

    if (!leaderboardEntry) {
      try {
        leaderboardEntry = await Leaderboard.create({
          userId,
          name: name || userExists.name || "Anonymous",
          donatedCount: 0,
        });
      } catch (createError) {
        // Handle race condition (duplicate key)
        if (createError.code === 11000) {
          leaderboardEntry = await Leaderboard.findOne({ userId });
          if (!leaderboardEntry) {
            throw new Error("Failed to create or fetch leaderboard entry");
          }
        } else {
          throw createError;
        }
      }
    }

    // Update name if changed
    if (leaderboardEntry.name !== name && name) {
      leaderboardEntry.name = name;
      await leaderboardEntry.save();
    }

    // Calculate rank
    const rank = await Leaderboard.getUserRank(
      userId,
      leaderboardEntry.donatedCount
    );

    return res.status(200).json({
      success: true,
      message: "User stats fetched successfully",
      data: {
        userId: leaderboardEntry.userId,
        name: leaderboardEntry.name,
        donatedCount: leaderboardEntry.donatedCount,
        rank,
        lastDonation: leaderboardEntry.lastUpdated,
        createdAt: leaderboardEntry.createdAt,
      },
    });
  } catch (error) {
    console.error(" getUserStats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user stats",
    });
  }
};

// GET USER RANK BY ID 
export const getUserRankById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // Check if user exists
    const user = await User.findById(userId).select("name email");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find leaderboard entry
    const leaderboardEntry = await Leaderboard.findOne({ userId });

    // User hasn't donated yet
    if (!leaderboardEntry) {
      return res.status(200).json({
        success: true,
        message: "User not on leaderboard yet",
        data: {
          userId,
          name: user.name,
          rank: null,
          donatedCount: 0,
          lastDonation: null,
        },
      });
    }

    // Calculate rank
    const rank = await Leaderboard.getUserRank(
      userId,
      leaderboardEntry.donatedCount
    );

    return res.status(200).json({
      success: true,
      message: "User rank fetched successfully",
      data: {
        userId,
        name: user.name,
        rank,
        donatedCount: leaderboardEntry.donatedCount,
        lastDonation: leaderboardEntry.lastUpdated,
      },
    });
  } catch (error) {
    console.error("getUserRankById error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user rank",
    });
  }
};
