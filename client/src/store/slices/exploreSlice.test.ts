import type { ExploreState, Post } from "@/types";
import { describe, expect, it } from "vitest";
import exploreReducer, { getExplore } from "./exploreSlice";

describe("exploreSlice", () => {
  const initialState: ExploreState = {
    posts: [],
    page: 1,
    hasMore: true,
    loading: false,
    error: null,
  };

  it("should handle getExplore.pending", () => {
    // ARRANGE
    const state = initialState;

    // ACT
    const newState = exploreReducer(
      state,
      getExplore.pending("exploreId-1", { page: 1, limit: 10 }),
    );

    // ASSERT
    expect(newState.loading).toBe(true);
    expect(newState.error).toBeNull();
  });

  it("should handle getExplore.fulfilled", () => {
    // ARRANGE
    const state = initialState;
    const mockPosts: Post[] = [
      {
        _id: "new-post-1",
        caption: "New Post",
        image: "https://example.com/image.jpg",
        likes: [],
        likesCount: 0,
        commentsCount: 0,
        hashtag: [],
        user: {
          _id: "user-1",
          username: "testuser",
          profilePicture: "",
          followers: [],
        },
        createdAt: "2024-01-15T10:00:00Z",
      },
    ];

    // ACT
    const newState = exploreReducer(
      state,
      getExplore.fulfilled(
        {
          posts: mockPosts,
          pagination: { currentPage: 1, hasMore: true },
        },
        "exploreId-1",
        { page: 1 },
      ),
    );

    // ASSERT
    expect(newState.loading).toBe(false);
    expect(newState.posts).toHaveLength(1);
    expect(newState.page).toBe(2);
    expect(newState.hasMore).toBe(true);
  });

  it("should handle getExplore.rejected", () => {
    // ARRANGE
    const state = initialState;
    const errorMessage = "Failed to fetch explore";

    // ACT
    const newState = exploreReducer(
      state,
      getExplore.rejected(
        null,
        "exploreId-1",
        {
          page: 1,
          limit: 10,
        },
        errorMessage,
      ),
    );

    // ASSERT
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe(errorMessage);
  });
});
