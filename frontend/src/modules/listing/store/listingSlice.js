import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  listing: [],
  filteredListing: [],
  currentListing: null,
  myListing: [],
  filters: {
    type: "", // 'medicine' | 'equipment'
    city: "", // City name
    status: "available", // 'available' | 'reserved' | 'donated'
  },
  isLoading: false,
  totalCount: 0,
  error: null,
  selectedListingId: null,
};

const listingSlice = createSlice({
  name: "listing",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    setListing: (state, action) => {
      state.listing = action.payload;
      state.filteredListing = action.payload;
      state.totalCount = action.payload.length;
      state.isLoading = false;
      state.error = null;
    },

    setMyListings: (state, action) => {
      state.myListing = action.payload;
      state.isLoading = false;
    },

    setCurrentListing: (state, action) => {
      state.currentListing = action.payload;
      state.selectedListingId = action.payload?._id || null;
      state.isLoading = false;
    },

    addListing: (state, action) => {
      state.listing.unshift(action.payload);
      state.myListing.unshift(action.payload);
      state.totalCount += 1;
      state.isLoading = false;
    },

    updateListing: (state, action) => {
      const updated = action.payload;
      state.listing = state.listing.map((item) =>
        item._id === updated._id ? updated : item
      );
      state.myListing = state.myListing.map((item) =>
        item._id === updated._id ? updated : item
      );
      if (state.currentListing?._id === updated._id) {
        state.currentListing = updated;
      }
    },

    deleteListing: (state, action) => {
      const id = action.payload;
      state.listing = state.listing.filter((item) => item._id !== id);
      state.myListing = state.myListing.filter((item) => item._id !== id);
      if (state.currentListing?._id === id) {
        state.currentListing = null;
      }
      state.totalCount -= 1;
    },

    // Filter listings based on active filters
    applyFilters: (state) => {
      const { type, city, status } = state.filters;
      state.filteredListing = state.listing.filter((item) => {
        return (
          (!type || item.type === type) &&
          (!city || item.city === city) &&
          (!status || item.status === status)
        );
      });
    },

    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const {
  setLoading,
  setError,
  setListing,
  setMyListings,
  setCurrentListing,
  addListing,
  updateListing,
  deleteListing,
  applyFilters,
  setFilters,
} = listingSlice.actions;

export default listingSlice.reducer;
