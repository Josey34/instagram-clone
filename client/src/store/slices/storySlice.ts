import type { StoryState } from "@/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import api from "../../api/axios";

const initialState: StoryState = {
    stories: [],
    userStories: [],
    loading: false,
    error: null,
};

export const getStories = createAsyncThunk(
    "story/getStories",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/stories/following");

            return data;
        } catch (e) {
            return rejectWithValue(
                axios.isAxiosError(e)
                    ? e.response?.data?.message
                    : "Failed to fetch stories"
            );
        }
    }
);

export const getUserStories = createAsyncThunk(
    "story/getUserStories",
    async (userId: string, { rejectWithValue }) => {
        try {
            const { data } = await api.get(`/stories/user/${userId}`);

            return data;
        } catch (e: unknown) {
            return rejectWithValue(
                axios.isAxiosError(e)
                    ? e.response?.data?.message
                    : "Failed to fetch user stories"
            );
        }
    }
);

export const createStory = createAsyncThunk(
    "story/createStory",
    async (formData: FormData, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/stories/create", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return data.story;
        } catch (e: unknown) {
            return rejectWithValue(
                axios.isAxiosError(e)
                    ? e.response?.data?.message
                    : "Failed to create story"
            );
        }
    }
);

export const deleteStory = createAsyncThunk(
    "story/deleteStory",
    async (storyId: string, { rejectWithValue }) => {
        try {
            await api.delete(`/stories/${storyId}`);
            return storyId;
        } catch (e: unknown) {
            return rejectWithValue(
                axios.isAxiosError(e)
                    ? e.response?.data?.message
                    : "Failed to delete story"
            );
        }
    }
);

export const viewStory = createAsyncThunk(
    "story/viewStory",
    async (storyId: string, { rejectWithValue }) => {
        try {
            const { data } = await api.put(`/stories/${storyId}/view`);
            return { storyId, story: data };
        } catch (e: unknown) {
            return rejectWithValue(
                axios.isAxiosError(e)
                    ? e.response?.data?.message
                    : "Failed to mark story as viewed"
            );
        }
    }
);

const storySlice = createSlice({
    name: "story",
    initialState,
    reducers: {
        clearStories: (state) => {
            state.stories = [];
            state.userStories = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // GET STORIES
        builder.addCase(getStories.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getStories.fulfilled, (state, action) => {
            state.loading = false;
            state.stories = action.payload;
        });
        builder.addCase(getStories.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // GET USER STORIES
        builder.addCase(getUserStories.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getUserStories.fulfilled, (state, action) => {
            state.loading = false;
            state.userStories = action.payload;
        });
        builder.addCase(getUserStories.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // CREATE STORY
        builder.addCase(createStory.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(createStory.fulfilled, (state, action) => {
            state.loading = false;
            if (Array.isArray(state.stories)) {
                state.stories.unshift(action.payload);
            }
            if (Array.isArray(state.userStories)) {
                state.userStories.unshift(action.payload);
            }
        });
        builder.addCase(createStory.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // DELETE STORY
        builder.addCase(deleteStory.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(deleteStory.fulfilled, (state, action) => {
            state.loading = false;
            state.stories = state.stories.filter(
                (story) => story._id !== action.payload
            );
            state.userStories = state.userStories.filter(
                (story) => story._id !== action.payload
            );
        });
        builder.addCase(deleteStory.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // VIEW STORY
        builder.addCase(viewStory.fulfilled, (state, action) => {
            const storyIndex = state.stories.findIndex(
                (s) => s._id === action.payload.storyId
            );
            if (storyIndex !== -1 && action.payload.story) {
                state.stories[storyIndex] = action.payload.story;
            }

            const userStoryIndex = state.userStories.findIndex(
                (s) => s._id === action.payload.storyId
            );
            if (userStoryIndex !== -1 && action.payload.story) {
                state.userStories[userStoryIndex] = action.payload.story;
            }
        });
    },
});


export const { clearStories } = storySlice.actions;
export default storySlice.reducer;