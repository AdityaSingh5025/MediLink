import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    loading: false,
    error: null,
    activeChat: null,
    chatList: [],
  },
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      // Avoid duplicates
      const exists = state.messages.some(m => m._id === action.payload._id);
      if (!exists) {
        state.messages.push(action.payload);
      }
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setChatList: (state, action) => {
      state.chatList = action.payload;
    },
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { 
  setLoading, 
  setMessages, 
  addMessage, 
  setError, 
  setChatList, 
  setActiveChat,
  clearMessages 
} = chatSlice.actions;

export default chatSlice.reducer;