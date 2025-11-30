import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import api from "../../api/axios";
import type { UserState } from "../../types";

const initialState: UserState = {
    profileUser: null,
    loading: false,
    error: null,
};

export const getUserByUsername = createAsyncThunk(
    "user/getUserByUsername",
    async (username: string, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/users/${username}`);
            
            return data;
        } catch (e: unknown) {
            return rejectWithValue(
                axios.isAxiosError(e)
                    ? e.response?.data?.message
                    : "Failed to fetch user"
            );
        }
    }
)

export const toggleFollow = createAsyncThunk(
    "user/toggleFollow",
    async (userId: string, { rejectWithValue }) => {
        try {
            const { data } = await api.post(`/users/${userId}/follow`);
            return data;
        } catch (e: unknown) {
            return rejectWithValue(
                axios.isAxiosError(e)
                    ? e.response?.data?.message
                    : "Failed to toggle follow"
            );
        }
    }
);

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        clearProfileUser: (state) => {
            state.profileUser = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        //  Get user by username
        builder.addCase(getUserByUsername.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getUserByUsername.fulfilled, (state, action) => {
            state.loading = false;
            state.profileUser = action.payload;
        });
        builder.addCase(getUserByUsername.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // TOGGLE FOLLOW
        builder.addCase(toggleFollow.fulfilled, (state, action) => {
            if (state.profileUser) {
                state.profileUser = action.payload.user;
            }
        });
    }
})

export const { clearProfileUser } = userSlice.actions;
export default userSlice.reducer;