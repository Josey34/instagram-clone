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

export const deletePost = createAsyncThunk(
    "post/deletePost",
    async (postId: string, { rejectWithValue }) => {
        try {
            await api.delete(`/posts/${postId}`);
            return postId;
        } catch (e: unknown) {
            return rejectWithValue(
                axios.isAxiosError(e)
                    ? e.response?.data?.message
                    : "Failed to delete post"
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

export const createPost = createAsyncThunk(
    "post/createPost",
    async (formData: FormData, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/posts/create", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return data.post;
        } catch (e: unknown) {
            return rejectWithValue(
                axios.isAxiosError(e)
                    ? e.response?.data?.message
                    : "Failed to create post"
            );
        }
    }
);

export const toggleSavePost = createAsyncThunk(
    "post/toggleSavePost",
    async (postId: string, { rejectWithValue }) => {
        try {
            const { data } = await api.post(`/posts/${postId}/save`);
            return { postId, data };
        } catch (e: unknown) {
            return rejectWithValue(
                axios.isAxiosError(e)
                    ? e.response?.data?.message
                    : "Failed to toggle save post"
            );
        }
    }
);

export const getExplorePosts = createAsyncThunk(
    "post/getExplorePosts",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/posts/explore");
            return data.posts;
        } catch (e: unknown) {
            return rejectWithValue(
                axios.isAxiosError(e)
                    ? e.response?.data?.message
                    : "Failed to fetch explore posts"
            );
        }
    }
);

export const searchPostsByHashtag = createAsyncThunk(
    "post/searchPostsByHashtag",
    async (hashtag: string, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/posts/search/hashtag?q=${encodeURIComponent(hashtag)}`);
            return data.posts;
        } catch (e: unknown) {
            return rejectWithValue(
                axios.isAxiosError(e)
                    ? e.response?.data?.message
                    : "Failed to search posts by hashtag"
            );
        }
    }
);

export const getPostById = createAsyncThunk(
    "post/getPostById",
    async (postId: string, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/posts/${postId}`);
            return data.post;
        } catch (e: unknown) {
            return rejectWithValue(
                axios.isAxiosError(e)
                    ? e.response?.data?.message
                    : "Failed to fetch post"
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

        // DELETE POST
        builder.addCase(deletePost.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(deletePost.fulfilled, (state, action) => {
            state.loading = false;
            // Remove the deleted post from the posts array
            state.posts = state.posts.filter(
                (post) => post._id !== action.payload
            );
        });
        builder.addCase(deletePost.rejected, (state, action) => {
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

        // CREATE POST
        builder.addCase(createPost.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(createPost.fulfilled, (state, action) => {
            state.loading = false;
            state.posts.unshift(action.payload);
        });
        builder.addCase(createPost.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // TOGGLE SAVE POST
        builder.addCase(toggleSavePost.fulfilled, (state, action) => {
            const postIndex = state.posts.findIndex(
                (p) => p._id === action.payload.postId
            );
            if (postIndex !== -1 && action.payload.data.post) {
                state.posts[postIndex] = action.payload.data.post;
            }
        });

        // GET EXPLORE POSTS
        builder.addCase(getExplorePosts.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getExplorePosts.fulfilled, (state, action) => {
            state.loading = false;
            state.posts = action.payload;
        });
        builder.addCase(getExplorePosts.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // SEARCH POSTS BY HASHTAG
        builder.addCase(searchPostsByHashtag.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(searchPostsByHashtag.fulfilled, (state, action) => {
            state.loading = false;
            state.posts = action.payload;
        });
        builder.addCase(searchPostsByHashtag.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // GET POST BY ID
        builder.addCase(getPostById.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getPostById.fulfilled, (state, action) => {
            state.loading = false;
            // Check if post already exists in posts array
            const postIndex = state.posts.findIndex(
                (p) => p._id === action.payload._id
            );
            if (postIndex !== -1) {
                state.posts[postIndex] = action.payload;
            } else {
                state.posts.push(action.payload);
            }
        });
        builder.addCase(getPostById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearPosts } = postSlice.actions;
export default postSlice.reducer;
