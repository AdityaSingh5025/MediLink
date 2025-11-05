import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      default: "Anonymous",
      trim: true,
    },
    donatedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

leaderboardSchema.index({
  donatedCount: -1,
  createdAt: 1,
});

leaderboardSchema.statics.getUserRank = async function (
  userId,
  userDonatedCount
) {
  const rank = await this.countDocuments({
    donatedCount: { $gt: userDonatedCount },
  });
  return rank + 1;
};

export default mongoose.model("Leaderboard", leaderboardSchema);
