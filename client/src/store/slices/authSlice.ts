import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import api from "../../api/axios";
import type {
    AuthState,
    LoginCredentials,
    RegisterCredentials,
} from "../../types";
import { toggleSavePost } from "./postSlice";

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem("token"),
    isAuthenticated: !!localStorage.getItem("token"),
    loading: false,
    error: null,
};

export const login = createAsyncThunk(
    "auth/login",
    async (credentials: LoginCredentials, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/auth/login", credentials);

            localStorage.setItem("token", data.token);
            return data;
        } catch (e: unknown) {
            return rejectWithValue(
                axios.isAxiosError(e)
                    ? e.response?.data?.message
                    : "An error occurred"
            );
        }
    }
);

export const register = createAsyncThunk(
    "auth/register",
    async (credentials: RegisterCredentials, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/auth/register", credentials);

            localStorage.setItem("token", data.token);
            return data;
        } catch (e: unknown) {
            return rejectWithValue(
                axios.isAxiosError(e)
                    ? e.response?.data?.message
                    : "An error occurred"
            );
        }
    }
);

export const getCurrentUser = createAsyncThunk(
    "auth/getCurrentUser",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await api.get("/users/me");

            return data;
        } catch (e: unknown) {
            return rejectWithValue(
                axios.isAxiosError(e)
                    ? e.response?.data?.message
                    : "An error occurred"
            );
        }
    }
);

export const updateProfile = createAsyncThunk(
    "auth/updateProfile",
    async (formData: FormData, { rejectWithValue }) => {
        try {
            const { data } = await api.put("/users/me", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return data;
        } catch (e: unknown) {
            return rejectWithValue(
                axios.isAxiosError(e)
                    ? e.response?.data?.message
                    : "Failed to update profile"
            );
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem("token");
            state.user = null;
            state.loading = false;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // LOGIN
        builder.addCase(login.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(login.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        });
        builder.addCase(login.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // REGISTER
        builder.addCase(register.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(register.fulfilled, (state, action) => {
            state.loading = false;
            state.user =
                action.payload.user || action.payload.userWithoutPassword;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        });
        builder.addCase(register.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // GET CURRENT USER
        builder.addCase(getCurrentUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getCurrentUser.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload;
            state.isAuthenticated = true;
        });
        builder.addCase(getCurrentUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // UPDATE PROFILE
        builder.addCase(updateProfile.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(updateProfile.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload;
        });
        builder.addCase(updateProfile.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // TOGGLE SAVE POST
        builder.addCase(toggleSavePost.fulfilled, (state, action) => {
            if (state.user) {
                const postId = action.payload.postId;
                const isSaved = action.payload.data.isSaved;

                if (isSaved) {
                    if (!state.user.savedPosts?.includes(postId)) {
                        state.user.savedPosts = [...(state.user.savedPosts || []), postId];
                    }
                } else {
                    state.user.savedPosts = (state.user.savedPosts || []).filter(
                        (id) => id !== postId
                    );
                }
            }
        });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
