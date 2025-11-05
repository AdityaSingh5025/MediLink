import mongoose from "mongoose";
import Listings from "../../models/Listing.js";

// Create a New Listing
export const createListing = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { title, description, type, expiryDate, location, photoURL } =
      req.body;

    if (!title || !description || !type || !location || !location.city) {
      return res.status(400).json({
        success: false,
        message: "title, description, type and location.city are required",
      });
    }

    // Define allowed types for listing
    const allowedTypes = ["medicine", "equipment"];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Allowed types: medicine, equipment",
      });
    }

    // Safely extract city and coordinates from location
    const city = location.city?.trim();
    const lat = location.lat ?? null;
    const lng = location.lng ?? null;

    if (lat !== null && (lat < -90 || lat > 90)) {
      return res.status(400).json({
        success: false,
        message: "Latitude must be between -90 and 90",
      });
    }

    if (lng !== null && (lng < -180 || lng > 180)) {
      return res.status(400).json({
        success: false,
        message: "Longitude must be between -180 and 180",
      });
    }

    const listingData = {
      ownerId: req.user.id,
      title: title.trim(),
      description: description.trim(),
      type,
      photoURL: photoURL?.trim() || null,
      location: { city, lat, lng },
    };

    // If medicine type, verify expiry date
    if (type === "medicine") {
      if (!expiryDate) {
        return res.status(400).json({
          success: false,
          message: "expiryDate is required for medicine listings",
        });
      }

      const parsed = new Date(expiryDate);

      if (isNaN(parsed.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid expiryDate format",
        });
      }

      if (parsed <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "expiryDate must be a future date",
        });
      }

      listingData.expiryDate = parsed;
    }

    const createdListing = await Listings.create(listingData);

    return res.status(201).json({
      success: true,
      message: "Listing created successfully",
      data: {
        id: createdListing._id,
        title: createdListing.title,
        type: createdListing.type,
      },
    });
  } catch (error) {
    console.error("Create listing error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create listing",
    });
  }
};

// Get All Listings
export const getAllListings = async (req, res) => {
  try {
    const { type, city, status, page = 1, limit = 20 } = req.query;

    let query = {};

    if (city) {
      query["location.city"] = {
        $regex: new RegExp(city.trim(), "i"),
      };
    }

    if (type) {
      const allowedTypes = ["medicine", "equipment"];
      if (!allowedTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid type. Must be 'medicine' or 'equipment'",
        });
      }
      query.type = type;
    }

    if (status) {
      const allowedStatus = ["available", "reserved", "donated"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }
      query.status = status;
    }

    // For medicines, only show non-expired listings
    if (type === "medicine") {
      query.expiryDate = { $gt: new Date() };
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [listings, total] = await Promise.all([
      Listings.find(query)
        .populate("ownerId", "name email avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Listings.countDocuments(query),
    ]);

    if (!listings.length) {
      return res.status(200).json({
        success: true,
        message: "No listings found",
        data: [],
        pagination: { page: pageNum, limit: limitNum, total: 0, pages: 0 },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Listings fetched successfully",
      data: listings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get all listings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch listings",
    });
  }
};

// Get a Listing by ID
export const getListing = async (req, res) => {
  try {
    const listingId = req.params.id;

    if (!listingId || !mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing ID format",
      });
    }

    const findListing = await Listings.findById(listingId)
      .populate("ownerId", "name email")
      .lean();

    if (!findListing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Listing fetched successfully",
      data: findListing,
    });
  } catch (error) {
    console.error("Get listing error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch listing",
    });
  }
};

// Update Listing Status
export const updateListingStatus = async (req, res) => {
  try {
    const listingId = req.params.id;
    const { status } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing ID format",
      });
    }

    const allowedStatus = ["available", "reserved", "donated"];

    if (!status || !allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be: available, reserved, or donated",
      });
    }

    const listing = await Listings.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Only the owner can update
    if (listing.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this listing",
      });
    }

    listing.status = status;
    await listing.save();

    return res.status(200).json({
      success: true,
      message: "Listing status updated successfully",
      data: {
        id: listing._id,
        status: listing.status,
      },
    });
  } catch (error) {
    console.error("Update listing status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update listing status",
    });
  }
};

// Update a Listing
export const updateListing = async (req, res) => {
  try {
    const { title, description, expiryDate, location, photoURL } = req.body;
    const listingId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing ID format",
      });
    }

    const listing = await Listings.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Only owner can update
    if (listing.ownerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this listing",
      });
    }

    // Partial update
    let updated = false;

    if (title) {
      listing.title = title.trim();
      updated = true;
    }

    if (description) {
      listing.description = description.trim();
      updated = true;
    }

    if (photoURL !== undefined) {
      listing.photoURL = photoURL?.trim() || null;
      updated = true;
    }

    if (
      location &&
      (location.city ||
        location.lat !== undefined ||
        location.lng !== undefined)
    ) {
      listing.location = {
        city: location.city?.trim() || listing.location.city,
        lat: location.lat ?? listing.location.lat,
        lng: location.lng ?? listing.location.lng,
      };
      updated = true;
    }

    // For medicine, validate new expiry date
    if (listing.type === "medicine" && expiryDate) {
      const parsed = new Date(expiryDate);

      if (isNaN(parsed.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid expiryDate format",
        });
      }

      if (parsed <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "expiryDate must be a future date",
        });
      }

      listing.expiryDate = parsed;
      updated = true;
    }

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    await listing.save();

    return res.status(200).json({
      success: true,
      message: "Listing updated successfully",
      data: listing,
    });
  } catch (error) {
    console.error("Update listing error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update listing",
    });
  }
};

// Delete a Listing
export const deleteListing = async (req, res) => {
  try {
    const listingId = req.params.id;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid listing ID format",
      });
    }

    const deletedListing = await Listings.findOneAndDelete({
      _id: listingId,
      ownerId: userId,
    });

    if (!deletedListing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found or you are not authorized to delete it",
      });
    }

    await Chat.deleteMany({ listingId });
    await Request.deleteMany({ listingId });

    return res.status(200).json({
      success: true,
      message: "Listing deleted successfully",
      data: { id: deletedListing._id },
    });
  } catch (error) {
    console.error("Delete listing error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete listing",
    });
  }
};

// Get All Listings Created by Logged-In User
export const getMyListings = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in first.",
      });
    }

    const userId = req.user.id;
    const { status, type } = req.query;

    let query = { ownerId: userId };

    if (status && ["available", "reserved", "donated"].includes(status)) {
      query.status = status;
    }

    if (type && ["medicine", "equipment"].includes(type)) {
      query.type = type;
    }

    const listings = await Listings.find(query).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      message: listings.length
        ? "Listings fetched successfully"
        : "No listings found",
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    console.error("Get my listings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your listings",
    });
  }
};
