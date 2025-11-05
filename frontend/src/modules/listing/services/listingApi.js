import { apiConnector } from "../../../core/axios/axios.config";

export const listingApi = {
  // Create a new listing
  createListing: async (data) => {
    const response = await apiConnector("POST", "/listing/create-listing", data);
    
    return response.success
      ? { success: true, data: response.data.data, message: response.data.message }
      : { success: false, error: response.error };
  },

  // Get all listings (with filters)
  getAllListings: async (filters = {}) => {
    const queryString = new URLSearchParams(
      Object.entries(filters).filter(([_, v]) => v)
    ).toString();
    
    const url = queryString
      ? `/listing/get-all-listing?${queryString}`
      : "/listing/get-all-listing";

    const response = await apiConnector("GET", url);
    
    return response.success
      ? { 
          success: true, 
          data: response.data.data || response.data,
          pagination: response.data.pagination
        }
      : { success: false, error: response.error };
  },

  // Get single listing
  getListing: async (id) => {
    const response = await apiConnector("GET", `/listing/get-listing/${id}`);
    
    return response.success
      ? { success: true, data: response.data.data }
      : { success: false, error: response.error };
  },

  // Get user's listings
  getMyListing: async (filters = {}) => {
    const queryString = new URLSearchParams(
      Object.entries(filters).filter(([_, v]) => v)
    ).toString();
    
    const url = queryString
      ? `/listing/mylisting?${queryString}`
      : "/listing/mylisting";

    const response = await apiConnector("GET", url);
    
    return response.success
      ? { success: true, data: response.data.data, count: response.data.count }
      : { success: false, error: response.error };
  },

  // Update listing
  updateListing: async (id, data) => {
    const response = await apiConnector("PUT", `/listing/update-listing/${id}`, data);
    
    return response.success
      ? { success: true, data: response.data.data, message: response.data.message }
      : { success: false, error: response.error };
  },

  // Update listing status
  updateListingStatus: async (id, status) => {
    const response = await apiConnector(
      "PATCH",
      `/listing/update-listing-status/${id}`,
      { status }
    );
    
    return response.success
      ? { success: true, data: response.data.data, message: response.data.message }
      : { success: false, error: response.error };
  },

  // Delete listing
  deleteListing: async (id) => {
    const response = await apiConnector("DELETE", `/listing/delete-listing/${id}`);
    
    return response.success
      ? { success: true, message: response.data.message }
      : { success: false, error: response.error };
  },
};