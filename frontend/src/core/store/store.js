import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../../modules/auth/store/authSlice'
import listingReducer from '../../modules/listing/store/listingSlice'
import requestReducer from '../../modules/request/store/requestSlice'
import chatReducer from '../../modules/chat/store/chatSlice'
import leaderBoardReducer from '../../modules/leaderboard/store/leaderBoardSlice'
export const store = configureStore({
  reducer: {
    auth: authReducer,
    listing : listingReducer,
    request : requestReducer,
    chat : chatReducer,
    leaderboard: leaderBoardReducer
  },
})
