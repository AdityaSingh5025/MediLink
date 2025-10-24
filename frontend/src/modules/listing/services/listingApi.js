import { apiConnector } from "../../../core/axios/axios.config";

export const listingApi = {
  // Create a new listing
  createListing: async (data) => {
    try {
      const response = await apiConnector("POST", "/listing/create-listing", data);
      if (!response.success) throw new Error(response.error);

      return {
        success: true,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to create listing",
      };
    }
  },

  // Get all listings (supports filters)
  getAllListings: async (filters = {}) => {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const url = queryString
        ? `/listing/get-all-listing?${queryString}`
        : "/listing/get-all-listing";

      const response = await apiConnector("GET", url);
      if (!response.success) throw new Error(response.error);

      return {
        success: true,
        data: response.data || response.data?.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to fetch listings",
      };
    }
  },

  // Get a specific listing by ID
  getListing: async (id) => {
    try {
      const response = await apiConnector("GET", `/listing/get-listing/${id}`);
      if (!response.success) throw new Error(response.error);

      return {
        success: true,
        data: response.data || response.data?.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to fetch listing",
      };
    }
  },

  // Update listing status
  updateListingStatus: async (id, data) => {
    try {
      const response = await apiConnector("PATCH", `/listing/update-listing-status/${id}`, data);
      if (!response.success) throw new Error(response.error);

      return {
        success: true,
        data: response.data || response.data?.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to update listing status",
      };
    }
  },

  // Update listing details
  updateListing: async (id, data) => {
    try {
      const response = await apiConnector("PUT", `/listing/update-listing/${id}`, data);
      if (!response.success) throw new Error(response.error);

      return {
        success: true,
        data: response.data || response.data?.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to update listing",
      };
    }
  },

  // Delete a listing
  deleteListing: async (id) => {
    try {
      const response = await apiConnector("DELETE", `/listing/delete-listing/${id}`);
      if (!response.success) throw new Error(response.error);

      return {
        success: true,
        data: response.data || response.data?.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to delete listing",
      };
    }
  },

  // Get listings created by the logged-in user
  getMyListing: async () => {
    try {
      const response = await apiConnector("GET", "/listing/mylisting");
      if (!response.success) throw new Error(response.error);

      return {
        success: true,
        data: response.data?.listings || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to fetch user listings",
      };
    }
  },
};
