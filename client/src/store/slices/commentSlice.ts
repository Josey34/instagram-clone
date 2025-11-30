import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import api from "../../api/axios";
import type { Comment } from "../../types";

interface CommentState {
    comments: { [postId: string]: Comment[] };
    loading: boolean;
    error: string | null;
}

const initialState: CommentState = {
    comments: {},
    loading: false,
    error: null,
};

export const getComments = createAsyncThunk(
    "comment/getComments",
    async (postId: string, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/posts/${postId}/comments`);
            return { postId, comments: data.comments };
        } catch (e: unknown) {
            return rejectWithValue(
                axios.isAxiosError(e)
                    ? e.response?.data.message
                    : "Failed to fetch comments"
            );
        }
    }
);

export const addComment = createAsyncThunk(
    "comment/addComment",
    async ({ postId, text }: { postId: string; text: string }, { rejectWithValue }) => {
        try {
            const { data } = await api.post(`/posts/${postId}/comments`, { text });
            return { postId, comment: data.comment };
        } catch (e: unknown) {
            return rejectWithValue(
                axios.isAxiosError(e)
                    ? e.response?.data.message
                    : "Failed to add comment"
            );
        }
    }
);

const commentSlice = createSlice({
    name: "comment",
    initialState,
    reducers: {
        clearComments: (state, action) => {
            if (action.payload) {
                delete state.comments[action.payload];
            } else {
                state.comments = {};
            }
        },
    },
    extraReducers: (builder) => {
        // GET COMMENTS
        builder.addCase(getComments.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getComments.fulfilled, (state, action) => {
            state.loading = false;
            state.comments[action.payload.postId] = action.payload.comments;
        });
        builder.addCase(getComments.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // ADD COMMENT
        builder.addCase(addComment.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(addComment.fulfilled, (state, action) => {
            state.loading = false;
            const { postId, comment } = action.payload;
            if (!state.comments[postId]) {
                state.comments[postId] = [];
            }
            state.comments[postId].unshift(comment);
        });
        builder.addCase(addComment.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearComments } = commentSlice.actions;
export default commentSlice.reducer;
