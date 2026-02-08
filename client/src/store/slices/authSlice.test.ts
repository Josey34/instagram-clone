import { describe, expect, it } from "vitest";
import type { AuthState, LoginCredentials, RegisterCredentials } from "../../types";
import authReducer, { clearError, getCurrentUser, login, logout, register, updateProfile } from "./authSlice";
import { toggleSavePost } from "./postSlice";

describe("authSlice", () => {
  const authenticatedState: AuthState = {
    user: {
      _id: "1",
      username: "testuser",
      fullname: "testUser1",
      email: "test@example.com",
      profilePicture: "",
      bio: "",
      followers: [],
      following: [],
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
    },
    token: "test-token-123",
    isAuthenticated: true,
    loading: false,
    error: null,
  };

  it("should return initial state", () => {
    // ARRANGE & ACT
    const state = authReducer(undefined, { type: "unknown" });

    // ASSERT
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBeFalsy();
    expect(state.loading).toBeFalsy();
    expect(state.error).toBeNull();
  });

  it("should handle logout", () => {
    // ARRANGE
    const state = authenticatedState;

    // ACT
    const newState = authReducer(state, logout());

    // ASSERT
    expect(newState.user).toBeNull();
    expect(newState.token).toBeNull();
    expect(newState.isAuthenticated).toBeFalsy();
    expect(newState.error).toBeNull();
    expect(newState.loading).toBeFalsy();
  });

  it("should clear error message", () => {
    // ARRANGE
    const stateWithError: AuthState = {
      ...authenticatedState,
      error: "Login failed",
    };

    // ACT
    const newState = authReducer(stateWithError, clearError());

    // ASSERT
    expect(newState.error).toBeNull();
  });
});

describe("login async thunk", () => {
  const mockCredentials: LoginCredentials = {
    username: "testuser",
    password: "password",
  };

  const mockLoginResponse = {
    user: {
      _id: "1",
      username: "testuser",
      fullname: "testUser1",
      email: "test@example.com",
      profilePicture: "",
      bio: "",
      followers: [],
      following: [],
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
    },
    token: "new-login-token",
  };

  it("should handle login.pending", () => {
    // ARRANGE - Start with initial/unauthenticated state
    const state = authReducer(undefined, { type: "unknown" });

    // ACT - Call reducer with login.pending
    const newState = authReducer(
      state,
      login.pending("request-id-1", mockCredentials),
    );

    // ASSERT - When loading starts:
    expect(newState.loading).toBe(true);
    expect(newState.error).toBeNull();
  });

  it("should handle login.fulfilled", () => {
    // ARRANGE
    const state = authReducer(undefined, { type: "unknown" });

    // ACT
    const newState = authReducer(
      state,
      login.fulfilled(mockLoginResponse, "request-id-1", mockCredentials),
    );

    // ASSERT
    expect(newState.loading).toBe(false);
    expect(newState.isAuthenticated).toBe(true);
    expect(newState.user).toBeDefined();
    expect(newState.token).toBe("new-login-token");
    expect(newState.error).toBeNull();
  });

  it("should handle login.rejected", () => {
    // ARRANGE
    const state = authReducer(undefined, { type: "unknown" });
    const errorMessage = "Invalid credentials";

    // ACT
    const newState = authReducer(
      state,
      login.rejected(null, "request-id-1", mockCredentials, errorMessage),
    );

    // ASSERT
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe("Invalid credentials");
    expect(newState.isAuthenticated).toBe(false);
    expect(newState.user).toBeNull();
    expect(newState.token).toBeNull();
  });
});

describe("register async thunk", () => {
  const mockCredentials: RegisterCredentials = {
    username: "testuser",
    fullname: "testinguser1",
    email: "test@example.com",
    password: "password",
  };

  const mockRegisterResponse = {
    user: {
      _id: "1",
      username: "testuser",
      fullname: "testUser1",
      email: "test@example.com",
      profilePicture: "",
      bio: "",
      followers: [],
      following: [],
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
    },
    token: "new-login-token",
  };
  
  it('should handle register.pending', () => {
    // ARRANGE
    const state = authReducer(undefined, { type: "unknown" });

    // ACT
    const newState = authReducer(
      state,
      register.pending("request-id-1", mockCredentials),
    );

    // ASSERT
    expect(newState.loading).toBe(true);
    expect(newState.error).toBeNull();
  });
  
  it('should handle regisiter.fulfilled', () => {
    // ARRANGE
    const state = authReducer(undefined, { type: "unknown" });
    
    // ACT
    const newState = authReducer(
      state,
      register.fulfilled(mockRegisterResponse, 'request-id-1', mockCredentials)
    );
    
    // ASSERT
    expect(newState.loading).toBe(false);
    expect(newState.isAuthenticated).toBe(true);
    expect(newState.user).toBeDefined();
    expect(newState.token).toBe("new-login-token");
    expect(newState.error).toBeNull();
  });
  
  it('should handle register.rejected', () => {
    // ARRANGE
    const state = authReducer(undefined, { type: "unknown" });
    const errorMessage = "User already exists";
    
    // ACT
    const newState = authReducer(
      state,
      register.rejected(null, 'request-id-1', mockCredentials, errorMessage)
    )
    
    // ASSERT
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe("User already exists");
    expect(newState.isAuthenticated).toBe(false);
    expect(newState.user).toBeNull();
    expect(newState.token).toBeNull();
  });
});

describe("getCurrentUser async thunk", () => {
  const mockGetCurrentUserResponse = {
    _id: "1",
    username: "testuser",
    fullname: "testUser1",
    email: "test@example.com",
    profilePicture: "",
    bio: "",
    followers: [],
    following: [],
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
  };

  it("should handle getCurrentUser.pending", () => {
    // ARRANGE
    const state = authReducer(undefined, { type: "unknown" });
    
    // ACT
    const newState = authReducer(state, getCurrentUser.pending("request-id-1", undefined));
    
    // ASSERT
    expect(newState.loading).toBe(true);
    expect(newState.error).toBeNull();
  });

  it("should handle getCurrentUser.fulfilled", () => {
    // ARRANGE
    const state = authReducer(undefined, { type: "unknown" });
    
    // ACT
    const newState = authReducer(
      state,
      getCurrentUser.fulfilled(mockGetCurrentUserResponse, "request-id-1", undefined)
    );
    
    // ASSERT
    expect(newState.loading).toBe(false);
    expect(newState.user).toBeDefined();
    expect(newState.isAuthenticated).toBe(true);
    expect(newState.error).toBeNull();
  });

  it("should handle getCurrentUser.rejected", () => {
    // ARRANGE
    const state = authReducer(undefined, { type: "unknown" });
    
    // ACT
    const newState = authReducer(
      state,
      getCurrentUser.rejected(null, "request-id-1", undefined, "Failed to fetch user")
    );
    
    // ASSERT
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe("Failed to fetch user");
    expect(newState.isAuthenticated).toBe(false);
  });
});

describe("updateProfile async thunk", () => {
  const mockUpdateProfileResponse = {
    _id: "1",
    username: "testuser",
    fullname: "testUser1",
    email: "test@example.com",
    profilePicture: "https://example.com/pic.jpg",
    bio: "Updated bio",
    followers: [],
    following: [],
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
  };

  it("should handle updateProfile.pending", () => {
    // ARRANGE
    const state = authReducer(undefined, { type: "unknown" });
    const formData = new FormData();
    
    // ACT
    const newState = authReducer(state, updateProfile.pending("request-id-1", formData));
    
    // ASSERT
    expect(newState.loading).toBe(true);
    expect(newState.error).toBeNull();
  });

  it("should handle updateProfile.fulfilled", () => {
    // ARRANGE
    const state = authReducer(undefined, { type: "unknown" });
    const formData = new FormData();
    
    // ACT
    const newState = authReducer(
      state,
      updateProfile.fulfilled(mockUpdateProfileResponse, "request-id-1", formData)
    );
    
    // ASSERT
    expect(newState.loading).toBe(false);
    expect(newState.user).toBeDefined();
    expect(newState.user?.bio).toBe("Updated bio");
    expect(newState.error).toBeNull();
  });

  it("should handle updateProfile.rejected", () => {
    // ARRANGE
    const state = authReducer(undefined, { type: "unknown" });
    const formData = new FormData();
    
    // ACT
    const newState = authReducer(
      state,
      updateProfile.rejected(null, "request-id-1", formData, "Failed to update profile")
    );
    
    // ASSERT
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe("Failed to update profile");
  });
});

describe("toggleSavePost async thunk", () => {
  it("should add postId to savedPosts when isSaved is true", () => {
    // ARRANGE
    const state = authReducer(undefined, { type: "unknown" });
    const authenticatedState = {
      ...state,
      user: {
        _id: "1",
        username: "testuser",
        fullname: "testUser1",
        email: "test@example.com",
        profilePicture: "",
        bio: "",
        followers: [],
        following: [],
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        savedPosts: [],
      },
      isAuthenticated: true,
    };
    
    // ACT
    const newState = authReducer(
      authenticatedState,
      toggleSavePost.fulfilled({ postId: "post-1", data: { isSaved: true } }, "request-id-1", "post-1")
    );
    
    // ASSERT
    expect(newState.user?.savedPosts).toContain("post-1");
  });

  it("should remove postId from savedPosts when isSaved is false", () => {
    // ARRANGE
    const state = authReducer(undefined, { type: "unknown" });
    const authenticatedState = {
      ...state,
      user: {
        _id: "1",
        username: "testuser",
        fullname: "testUser1",
        email: "test@example.com",
        profilePicture: "",
        bio: "",
        followers: [],
        following: [],
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        savedPosts: ["post-1", "post-2"],
      },
      isAuthenticated: true,
    };
    
    // ACT
    const newState = authReducer(
      authenticatedState,
      toggleSavePost.fulfilled({ postId: "post-1", data: { isSaved: false } }, "request-id-1", "post-1")
    );

    // ASSERT
    expect(newState.user?.savedPosts).not.toContain("post-1");
    expect(newState.user?.savedPosts).toContain("post-2");
  });
});

