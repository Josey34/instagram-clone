import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import api from "../../api/axios";
import type { PostState } from "../../types";
import { addComment, deleteComment } from "./commentSlice";

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

export const getFeed = createAsyncThunk(
    "post/getFeed",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/posts/feed");

            return data.posts;
        } catch (e: unknown) {
            return rejectWithValue(
                axios.isAxiosError(e)
                    ? e.response?.data.message
                    : "Failed to fetch feed"
            );
        }
    }
);

export const toggleLike = createAsyncThunk(
    "post/toggleLike",
    async (postId: string, { rejectWithValue }) => {
        try {
            const { data } = await api.post(`/posts/${postId}/like`);
            return { postId, data };
        } catch (e: unknown) {
            return rejectWithValue(
                axios.isAxiosError(e)
                    ? e.response?.data.message
                    : "Failed to toggle like"
            );
        }
    }
);

export const getSavedPosts = createAsyncThunk(
    "post/getSavedPosts",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/posts/saved");
            return data.posts;
        } catch (e: unknown) {
            return rejectWithValue(
                axios.isAxiosError(e)
                    ? e.response?.data?.message
                    : "Failed to fetch saved posts"
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
        // GET USER POSTS
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

        // GET FEED
        builder.addCase(getFeed.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getFeed.fulfilled, (state, action) => {
            state.loading = false;
            state.posts = action.payload;
        });
        builder.addCase(getFeed.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // TOGGLE LIKE
        builder.addCase(toggleLike.fulfilled, (state, action) => {
            const postIndex = state.posts.findIndex(
                (p) => p._id === action.payload.postId
            );
            if (postIndex !== -1 && action.payload.data.post) {
                state.posts = [
                    ...state.posts.slice(0, postIndex),
                    action.payload.data.post,
                    ...state.posts.slice(postIndex + 1),
                ];
            }
        });

        // ADD COMMENT - increment commentsCount
        builder.addCase(addComment.fulfilled, (state, action) => {
            const postIndex = state.posts.findIndex(
                (p) => p._id === action.payload.postId
            );
            if (postIndex !== -1) {
                state.posts[postIndex].commentsCount += 1;
            }
        });

        // DELETE COMMENT - decrement commentsCount
        builder.addCase(deleteComment.fulfilled, (state, action) => {
            const postIndex = state.posts.findIndex(
                (p) => p._id === action.payload.postId
            );
            if (postIndex !== -1) {
                state.posts[postIndex].commentsCount = Math.max(
                    0,
                    state.posts[postIndex].commentsCount - 1
                );
            }
        });

        // GET SAVED POSTS
        builder.addCase(getSavedPosts.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getSavedPosts.fulfilled, (state, action) => {
            state.loading = false;
            state.posts = action.payload;
        });
        builder.addCase(getSavedPosts.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearPosts } = postSlice.actions;
export default postSlice.reducer;
