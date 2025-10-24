import User from "../../models/User.js";
import Profile from "../../models/Profile.js";


export const createProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId).select("name");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { dateOfBirth, gender, contactNumber, addresses, profilePicture } = req.body;

    // Validate gender
    const allowedGenders = ["male", "female", "other"];
    if (gender && !allowedGenders.includes(gender.toLowerCase())) {
      return res.status(400).json({ success: false, message: "Invalid gender" });
    }

    // Validate contact number
    if (contactNumber && typeof contactNumber !== "string") {
      return res.status(400).json({ success: false, message: "Invalid contactNumber" });
    }

    // Validate date format
    if (dateOfBirth && isNaN(new Date(dateOfBirth).getTime())) {
      return res.status(400).json({ success: false, message: "Invalid date format" });
    }

    // Normalize addresses
    const normalizedAddresses = Array.isArray(addresses)
      ? addresses.map((addr) => ({
          label: addr.label || "other",
          street: addr.street || "",
          city: addr.city || "",
          state: addr.state || "",
          country: addr.country || "",
          postalCode: addr.postalCode || "",
          isDefault: !!addr.isDefault,
        }))
      : undefined;

    // Set default profile picture if not provided
    const pictureValue = profilePicture
      ? profilePicture
      : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || "User")}`;

    // Prepare the payload only with defined fields
    const payload = {};
    if (dateOfBirth) payload.dateOfBirth = new Date(dateOfBirth);
    if (gender) payload.gender = gender.toLowerCase();
    if (contactNumber) payload.contactNumber = contactNumber;
    if (normalizedAddresses !== undefined) payload.addresses = normalizedAddresses;
    if (pictureValue) payload.profilePicture = pictureValue;
    payload.user = user._id;

    // Check if profile exists
    const existingProfile = await Profile.findOne({ user: user._id });

    if (!existingProfile) {
      // Create new profile
      const profile = await Profile.create(payload);
      return res.status(201).json({
        success: true,
        message: "Profile created successfully",
        profile,
      });
    }

    // Update existing profile safely (only set provided fields)
    await Profile.updateOne({ user: user._id }, { $set: payload }, { runValidators: true });
    const updatedProfile = await Profile.findOne({ user: user._id });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (err) {
     return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const profile = await Profile.findOne({ user: userId })
      .populate("user", "name email accountType")
      .lean();

    if (!profile) {
      return res.status(200).json({
        success: false,
        profile: null,
        message: "Profile not found for this user",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      profile,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
