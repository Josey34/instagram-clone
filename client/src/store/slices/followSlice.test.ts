import { describe, expect, it } from "vitest";
import type { User } from "../../types";
import followReducer, {
  clearFollowData,
  getFollowers,
  getFollowing,
} from "./followSlice";

describe("followSlice", () => {
  const initialState = {
    followers: [],
    following: [],
    loading: false,
    error: null,
  };

  const mockUser: User = {
    _id: "user-1",
    username: "testuser",
    fullname: "Test User",
    email: "test@example.com",
    profilePicture: "https://example.com/pic.jpg",
    bio: "Test bio",
    followers: [],
    following: [],
    followersCount: 10,
    followingCount: 5,
    postsCount: 20,
  };

  // INITIAL STATE
  it("should return initial state", () => {
    // ARRANGE & ACT
    const state = followReducer(undefined, { type: "unknown" });

    // ASSERT
    expect(state.followers).toEqual([]);
    expect(state.following).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  // CLEAR FOLLOW DATA
  it("should clear all follow data", () => {
    // ARRANGE
    const stateWithData = {
      followers: [mockUser],
      following: [mockUser],
      loading: false,
      error: "Some error",
    };

    // ACT
    const newState = followReducer(stateWithData, clearFollowData());

    // ASSERT
    expect(newState.followers).toEqual([]);
    expect(newState.following).toEqual([]);
    expect(newState.error).toBeNull();
  });

  // GET FOLLOWERS
  describe("getFollowers async thunk", () => {
    it("should handle getFollowers.pending", () => {
      // ARRANGE
      const state = initialState;

      // ACT
      const newState = followReducer(
        state,
        getFollowers.pending("request-id-1", "user-1"),
      );

      // ASSERT
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it("should handle getFollowers.fulfilled", () => {
      // ARRANGE
      const state = initialState;
      const mockFollowers: User[] = [mockUser];

      // ACT
      const newState = followReducer(
        state,
        getFollowers.fulfilled(mockFollowers, "request-id-1", "user-1"),
      );

      // ASSERT
      expect(newState.loading).toBe(false);
      expect(newState.followers).toHaveLength(1);
      expect(newState.followers[0].username).toBe("testuser");
    });

    it("should handle getFollowers.rejected", () => {
      // ARRANGE
      const state = initialState;

      // ACT
      const newState = followReducer(
        state,
        getFollowers.rejected(
          null,
          "request-id-1",
          "user-1",
          "Failed to fetch followers",
        ),
      );

      // ASSERT
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe("Failed to fetch followers");
    });
  });

  // GET FOLLOWING
  describe("getFollowing async thunk", () => {
    it("should handle getFollowing.pending", () => {
      // ARRANGE
      const state = initialState;

      // ACT
      const newState = followReducer(
        state,
        getFollowing.pending("request-id-1", "user-1"),
      );

      // ASSERT
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it("should handle getFollowing.fulfilled", () => {
      // ARRANGE
      const state = initialState;
      const mockFollowing: User[] = [mockUser];

      // ACT
      const newState = followReducer(
        state,
        getFollowing.fulfilled(mockFollowing, "request-id-1", "user-1"),
      );

      // ASSERT
      expect(newState.loading).toBe(false);
      expect(newState.following).toHaveLength(1);
      expect(newState.following[0].username).toBe("testuser");
    });

    it("should handle getFollowing.rejected", () => {
      // ARRANGE
      const state = initialState;

      // ACT
      const newState = followReducer(
        state,
        getFollowing.rejected(
          null,
          "request-id-1",
          "user-1",
          "Failed to fetch following",
        ),
      );

      // ASSERT
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe("Failed to fetch following");
    });
  });
});
