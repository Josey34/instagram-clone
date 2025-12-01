import type { SearchState } from "@/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import api from "../../api/axios";


const initialState: SearchState = {
    query: "",
    results: [],
    loading: false,
    error: null,
};

export const searchUsers = createAsyncThunk(
    "search/searchUsers",
    async (query: string, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/users/search?query=${query}`);

            return data;
        } catch (e: unknown) {
            return rejectWithValue(
                axios.isAxiosError(e)
                    ? e.response?.data.message
                    : "Failed to search users"
            );
        }
    }
);

const searchSlice = createSlice({
    name: "search",
    initialState,
    reducers: {
        clearSearch: (state) => {
            state.results = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        //  SEARCH USERS
        builder.addCase(searchUsers.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(searchUsers.fulfilled, (state, action) => {
            state.loading = false;
            state.results = action.payload;
        });
        builder.addCase(searchUsers.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    },
});

export const { clearSearch } = searchSlice.actions;
export default searchSlice.reducer;