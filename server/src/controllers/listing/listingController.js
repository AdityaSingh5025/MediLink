import Listings from "../../models/Listing.js";


// Create a New Listing
export const createListing = async (req, res) => {
  try {
    // Ensure that the user making the request is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { title, description, type, expiryDate, location, photoURL } =
      req.body;

    // Check if the required fields are present
    if (!title || !description || !type || !location || !location.city) {
      return res.status(400).json({
        success: false,
        message: "title, description, type and location.city are required",
      });
    }

    // Define allowed types for listing
    const allowedTypes = ["medicine", "equipment"];

    // Validate the type of listing
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Allowed types",
      });
    }

    // Safely extract city and coordinates from location
    const city = location.city;
    const lat = location.lat ?? null;
    const lng = location.lng ?? null;

    // Build the listing object to be stored in the database
    const listingData = {
      ownerId: req.user.id,
      title: typeof title === "string" ? title.trim() : title,
      description:
        typeof description === "string" ? description.trim() : description,
      type,
      photoURL: photoURL ?? null,
      location: { city, lat, lng },
    };

    // If the listing is a medicine type, verify expiry date
    if (type === "medicine") {
      if (!expiryDate) {
        return res.status(400).json({
          success: false,
          message: "expiryDate is required for medicine listings",
        });
      }

      const parsed = new Date(expiryDate);

      if (Number.isNaN(parsed.getTime())) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid expiryDate format" });
      }

      // Ensure expiry date is in the future
      if (parsed <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "expiryDate must be a future date",
        });
      }

      listingData.expiryDate = parsed;
    }

    // Create the new listing in the database
    const createdListing = await Listings.create(listingData);

    return res.status(201).json({
      success: true,
      message: "Listing created successfully",
      data: createdListing.id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

//Get All Listings
export const getAllListings = async (req, res) => {
  try {
    const { type, city, status } = req.query;

    let query = {};
    if (city) query["location.city"] = city;
    if (type) query.type = type;
    if (status) query.status = status;

    // For medicines, only show listings with a valid expiry date
    if (type === "medicine") {
      query.expiryDate = { $gt: new Date() };
    }

    const findItem = await Listings.find(query);

    if (findItem.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No items found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Items found",
      count: findItem.length,
      data: findItem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// Get a Listing by ID
export const getListing = async (req, res) => {
  try {
    const listingId = req.params.id;

    if (!listingId) {
      return res.status(400).json({
        success: false,
        message: "Listing ID is required",
      });
    }

    const findListing = await Listings.findById(listingId);

    if (!findListing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Item found successfully",
      data: findListing,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

//Update Listing Status
export const updateListingStatus = async (req, res) => {
  try {
    const listingId = req.params.id;
    const { status } = req.body;
    const userId = req.user.id;

    const allowedStatus = ["available", "reserved"];
    
    // Validate allowed status values
    if (!allowedStatus.includes(status)) {
      return res.status(404).json({
        success: false,
        message:
          "Invalid status value. Must be available, reserved, or donated.",
      });
    }

    const findListingAndUpdate = await Listings.findById(listingId);

    if (!findListingAndUpdate) {
      return res.status(400).json({ error: "Listing not found" });
    }

    // Only the owner of the listing can update it
    if (findListingAndUpdate.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this listing",
      });
    }

    // Update the listing status
    findListingAndUpdate.status = status;
    await findListingAndUpdate.save();

    res.json({
      message: "Listing updated successfully",
      listing: findListingAndUpdate,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// Update a Listing 
export const updateListing = async (req, res) => {
  try {
    const { title, description, expiryDate, location, photoURL } = req.body;
    const listingId = req.params.id;

    const listing = await Listings.findById(listingId);

    // Only owner can update their listing
    if (listing.ownerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this listing",
      });
    }

    // Partial update: update only fields that are provided
    let updated = false;
    if (title) {
      listing.title = title;
      updated = true;
    }
    if (description) {
      listing.description = description;
      updated = true;
    }
    if (photoURL) {
      listing.photoURL = photoURL;
      updated = true;
    }
    if (location && (location.city || location.lat || location.lng)) {
      listing.location = {
        city: location.city ?? listing.location.city,
        lat: location.lat ?? listing.location.lat,
        lng: location.lng ?? listing.location.lng,
      };
      updated = true;
    }

    // For medicine listings, validate new expiry date
    if (listing.type === "medicine" && expiryDate) {
      const d = new Date(expiryDate);
      if (isNaN(d))
        return res
          .status(400)
          .json({ success: false, message: "Invalid expiryDate" });
      listing.expiryDate = d;
      updated = true;
    }

    // Return if no changes were made
    if (!updated)
      return res
        .status(400)
        .json({ success: false, message: "Nothing to update" });

    await listing.save();

    return res.status(200).json({
      message: "Listing updated succesfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

//Delete a Listing
export const deleteListing = async (req, res) => {
  try {
    const listingId = req.params.id;
    const userId = req.user.id;

    // Delete only if the listing belongs to the logged-in user
    const deleteListing = await Listings.findOneAndDelete({
      _id: listingId,
      ownerId: userId,
    });

    if (!deleteListing) {
      return res.status(400).json({
        success: false,
        message: "Listing not found or you are not authorized to delete it.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Listing deleted successfully",
      deleteListing,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

//Get All Listings Created by Logged-In User 
export const getMyListings = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in first.",
      });
    }

    const userId = req.user.id;

    // Find all listings belonging to the current user
    const listings = await Listings.find({ ownerId: userId }).sort({
      createdAt: -1,
    });

    if (!listings.length) {
      return res.status(200).json({
        success: true,
        message: "No listings found for this user.",
        listings: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "User listings fetched successfully",
      listings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching user listings.",
      error: error.message,
    });
  }
};
