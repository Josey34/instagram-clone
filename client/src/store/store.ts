import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice';
import commentReducer from './slices/commentSlice';
import notificationReducer from './slices/notificationSlice';
import postReducer from './slices/postSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        notification: notificationReducer,
        post: postReducer,
        user: userReducer,
        comment: commentReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;