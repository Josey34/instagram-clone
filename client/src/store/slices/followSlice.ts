import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import api from "../../api/axios";
import type { User } from "../../types";

interface FollowState {
    followers: User[];
    following: User[];
    loading: boolean;
    error: string | null;
}

const initialState: FollowState = {
    followers: [],
    following: [],
    loading: false,
    error: null,
};

export const getFollowers = createAsyncThunk(
    "follow/getFollowers",
    async (userId: string, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/users/${userId}/followers`);
            return data;
        } catch (e: unknown) {
            return rejectWithValue(
                axios.isAxiosError(e)
                    ? e.response?.data?.message
                    : "Failed to fetch followers"
            );
        }
    }
);

export const getFollowing = createAsyncThunk(
    "follow/getFollowing",
    async (userId: string, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/users/${userId}/following`);
            return data;
        } catch (e: unknown) {
            return rejectWithValue(
                axios.isAxiosError(e)
                    ? e.response?.data?.message
                    : "Failed to fetch following"
            );
        }
    }
);

const followSlice = createSlice({
    name: "follow",
    initialState,
    reducers: {
        clearFollowData: (state) => {
            state.followers = [];
            state.following = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // GET FOLLOWERS
        builder.addCase(getFollowers.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getFollowers.fulfilled, (state, action) => {
            state.loading = false;
            state.followers = action.payload;
        });
        builder.addCase(getFollowers.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // GET FOLLOWING
        builder.addCase(getFollowing.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getFollowing.fulfilled, (state, action) => {
            state.loading = false;
            state.following = action.payload;
        });
        builder.addCase(getFollowing.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearFollowData } = followSlice.actions;
export default followSlice.reducer;
