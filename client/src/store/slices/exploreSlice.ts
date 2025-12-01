import type { ExploreState } from "@/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import api from "../../api/axios";

const initialState: ExploreState = {
    posts: [],
    page: 1,
    hasMore: true,
    loading: false,
    error: null,
};

export const getExplore = createAsyncThunk(
    "explore/getExplore",
    async (
        { page, limit = 20 }: { page: number; limit?: number },
        { rejectWithValue }
    ) => {
        try {
            const { data } = await api.get(
                `/posts/explore?page=${page}&limit=${limit}`
            );

            return data;
        } catch (e) {
            return rejectWithValue(
                axios.isAxiosError(e)
                    ? e.response?.data.message
                    : "Failed to fetch explore"
            );
        }
    }
);

const exploreSlice = createSlice({
    name: "explore",
    initialState,
    reducers: {
        clearExplore: (state) => {
            state.posts = [];
            state.page = 1;
            state.hasMore = true;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        //  GET EXPLORE
        builder.addCase(getExplore.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getExplore.fulfilled, (state, action) => {
            state.loading = false;
            if (state.page === 1) {
                state.posts = action.payload.posts;
            } else {
                state.posts = [...state.posts, ...action.payload.posts];
            }
            state.page = state.page + 1; // Increment page for next load
            state.hasMore = action.payload.hasMore;
        });
        builder.addCase(getExplore.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearExplore } = exploreSlice.actions;
export default exploreSlice.reducer;
