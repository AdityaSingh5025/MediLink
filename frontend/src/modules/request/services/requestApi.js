import { apiConnector } from "../../../core/axios/axios.config";

export const requestApi = {
  // Create new request
  createRequest: async (listingId, data) => {
    try {
      const response = await apiConnector(
        "POST",
        `/request/create-request/${listingId}`,
        data
      );

      return {
        success: true,
        data: response.data?.request || response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to create request",
      };
    }
  },

  // Get all requests for a specific listing it is for admin only
  getRequestForListing: async (listingId) => {
    try {
      const response = await apiConnector(
        "GET",
        `/request/listing/${listingId}`
      );

      return {
        success: true,
        data: response.data?.requests || response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to get requests for listing",
      };
    }
  },

  // Get all requests of the logged-in user
  getMyRequest: async (role = null) => {
    try {
      const url = role
        ? `/request/getrequest-my?role=${role}`
        : `/request/getrequest-my`;
      const response = await apiConnector("GET", url);

      return {
        success: true,
        data: response.data?.requests || response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to get my requests",
      };
    }
  },

  // Approve request
  approveRequest: async (requestId) => {
    try {
      const response = await apiConnector("PUT", `/request/${requestId}/approve`);
      return {
        success: true,
        data: response.data?.request || response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to approve request",
      };
    }
  },

  // Cancel request
  cancelRequest: async (requestId) => {
    try {
      const response = await apiConnector("PUT", `/request/${requestId}/cancel`);
      return {
        success: true,
        data: response.data?.request || response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to cancel request",
      };
    }
  },

  // Reject request
  rejectRequest: async (requestId) => {
    try {
      const response = await apiConnector("PUT", `/request/${requestId}/reject`);
      return {
        success: true,
        data: response.data?.request || response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to reject request",
      };
    }
  },

  // Complete request
  completeRequest: async (requestId) => {
    try {
      const response = await apiConnector(
        "PUT",
        `/request/${requestId}/complete`
      );
      return {
        success: true,
        data: response.data?.request || response.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to complete request",
      };
    }
  },

  // donated 
  markAsDonated: async (requestId) => {
  try {
    const response = await apiConnector("PUT", `/request/${requestId}/mark-donated`);
    return {
      success: true,
      data: response.data?.request || response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error || error.message || "Failed to mark as donated",
    };
  }
},
};
