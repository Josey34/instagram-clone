import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import api from "../../api/axios";
import type { PostState } from "../../types";

const initialState: PostState = {
    posts: [],
    loading: false,
    error: null,
};

export const getUserPosts = createAsyncThunk(
    "post/getUserPosts",
    async (userId: string, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/posts/user/${userId}`);

            return data.posts;
        } catch (e: unknown) {
            return rejectWithValue(
                axios.isAxiosError(e)
                    ? e.response?.data.message
                    : "Failed to fetch posts"
            );
        }
    }
);

const postSlice = createSlice({
    name: "post",
    initialState,
    reducers: {
        clearPosts: (state) => {
            state.posts = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getUserPosts.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getUserPosts.fulfilled, (state, action) => {
            state.loading = false;
            state.posts = action.payload;
        });
        builder.addCase(getUserPosts.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearPosts } = postSlice.actions;
export default postSlice.reducer;