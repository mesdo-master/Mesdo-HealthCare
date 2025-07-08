import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/authSlice'
import chatReducer from './features/chatSlice'
import UserProfileReducer from './features/user/profileSlice'
import jobReducer from './features/user/jobSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        chat:chatReducer,
        userProfile:UserProfileReducer,
        job:jobReducer,
    },
})