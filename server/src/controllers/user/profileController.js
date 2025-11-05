import mongoose from "mongoose";
import User from "../../models/User.js";
import Profile from "../../models/Profile.js";

export const createProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid user ID",
      });
    }

    const user = await User.findById(userId).select("name");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { dateOfBirth, gender, contactNumber, addresses, profilePicture } =
      req.body;

    // Validate gender if provided
    const allowedGenders = ["male", "female", "other"];
    if (gender && !allowedGenders.includes(gender.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid gender. Must be: male, female, or other",
      });
    }

    // Validate date of birth
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format",
        });
      }
    }

    // Validate and normalize addresses
    let normalizedAddresses = [];
    if (addresses && Array.isArray(addresses)) {
      for (let i = 0; i < addresses.length; i++) {
        const addr = addresses[i];

        if (!addr.city || !addr.city.trim()) {
          return res.status(400).json({
            success: false,
            message: `Address at index ${i} must have a city`,
          });
        }

        normalizedAddresses.push({
          label: addr.label?.toLowerCase() || "other",
          street: addr.street?.trim() || "",
          city: addr.city.trim(),
          state: addr.state?.trim() || "",
          country: addr.country?.trim() || "",
          postalCode: addr.postalCode?.trim() || "",
        });
      }
    }

    // Set default profile picture if not provided
    const pictureValue = profilePicture
      ? profilePicture.trim()
      : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          user.name || "User"
        )}`;

    // Prepare payload
    const payload = {
      user: user._id,
    };

    if (dateOfBirth) payload.dateOfBirth = new Date(dateOfBirth);
    if (gender) payload.gender = gender.toLowerCase();
    if (contactNumber) payload.contactNumber = contactNumber.trim();
    if (normalizedAddresses.length > 0) payload.addresses = normalizedAddresses;
    if (pictureValue) payload.profilePicture = pictureValue;

    // Check if profile exists
    const existingProfile = await Profile.findOne({ user: user._id });

    if (!existingProfile) {
      const profile = await Profile.create(payload);
      return res.status(201).json({
        success: true,
        message: "Profile created successfully",
        data: profile,
      });
    }

    // Update existing profile
    await Profile.updateOne(
      { user: user._id },
      { $set: payload },
      { runValidators: true }
    );

    const updatedProfile = await Profile.findOne({ user: user._id });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (err) {
    console.error("createProfile error:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to save profile",
    });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid user ID",
      });
    }

    const profile = await Profile.findOne({ user: userId })
      .populate("user", "name email accountType createdAt")
      .lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found. Please create your profile first.",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      data: profile,
    });
  } catch (error) {
    console.error("getUserDetails error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user details",
    });
  }
};

export const addAddress = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid user ID",
      });
    }

    const { label, street, city, state, country, postalCode } = req.body;

    if (!city || !city.trim()) {
      return res.status(400).json({
        success: false,
        message: "City is required",
      });
    }

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found. Please create your profile first.",
      });
    }

    const newAddress = {
      label: label?.toLowerCase() || "other",
      street: street?.trim() || "",
      city: city.trim(),
      state: state?.trim() || "",
      country: country?.trim() || "",
      postalCode: postalCode?.trim() || "",
    };

    profile.addresses.push(newAddress);
    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Address added successfully",
      data: profile.addresses,
    });
  } catch (error) {
    console.error("addAddress error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add address",
    });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params;
    const { label, street, city, state, country, postalCode } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid user ID",
      });
    }

    if (!addressId || !mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID",
      });
    }

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    const address = profile.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Update fields
    if (label) address.label = label.toLowerCase();
    if (street !== undefined) address.street = street.trim();
    if (city) address.city = city.trim();
    if (state !== undefined) address.state = state.trim();
    if (country !== undefined) address.country = country.trim();
    if (postalCode !== undefined) address.postalCode = postalCode.trim();

    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: profile.addresses,
    });
  } catch (error) {
    console.error("updateAddress error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update address",
    });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid user ID",
      });
    }

    if (!addressId || !mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID",
      });
    }

    const profile = await Profile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    const addressToRemove = profile.addresses.id(addressId);
    if (!addressToRemove) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    addressToRemove.deleteOne();
    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      data: profile.addresses,
    });
  } catch (error) {
    console.error("deleteAddress error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete address",
    });
  }
};
