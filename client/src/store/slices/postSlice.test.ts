import type { Post, PostState } from "@/types";
import { describe, expect, it } from "vitest";
import postReducer, { clearPosts, createPost, deletePost, getFeed, getSavedPosts, getUserPosts, toggleLike, toggleSavePost } from "./postSlice";

describe("postSlice", () => {
  const initialState: PostState = {
    posts: [],
    loading: false,
    error: null,
  };
  it("should return initial state", () => {
    // ARRANGE
    const state = initialState;

    // ACT
    const newState = postReducer(state, { type: "unknown" });

    // ASSERT
    expect(newState.posts).toHaveLength(0);
    expect(newState.loading).toBeFalsy();
    expect(newState.error).toBe(null);
  });

  it("should clear posts", () => {
    // ARRANGE
    const state: PostState = {
      posts: [
        {
          _id: "1",
          user: {
            _id: "1",
            username: "testuser",
            profilePicture: "",
            followers: [],
          },
          caption: "Test post",
          image: "https://example.com/image.jpg",
          likes: ["userId1", "userId2"],
          hashtag: ["react", "testing"],
          likesCount: 2,
          commentsCount: 0,
          createdAt: "2024-01-15T10:00:00Z",
        },
      ],
      loading: false,
      error: "Failed to load posts",
    };

    // ACT
    const newState = postReducer(state, clearPosts());

    // ASSERT
    expect(newState.posts).toHaveLength(0);
    expect(newState.loading).toBeFalsy();
    expect(newState.error).toBe(null);
  });
});

describe("getUserPosts async thunk", () => {
  it("should handle getUserPosts.pending", () => {
    // ARRANGE
    const state: PostState = { posts: [], loading: false, error: null };

    // ACT
    const result = postReducer(
      state,
      getUserPosts.pending("request-id-1", "user-1"),
    );

    // ASSERT
    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  it("should handle getUserPosts.fulfilled", () => {
    // ARRANGE
    const state: PostState = { posts: [], loading: false, error: null };

    const mockPosts: Post[] = [
      {
        _id: "1",
        caption: "Test",
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
    const result = postReducer(
      state,
      getUserPosts.fulfilled(mockPosts, "request-id-1", "user-1"),
    );

    // ASSERT
    expect(result.loading).toBe(false);
    expect(result.posts).toHaveLength(1);
  });

  it("should handle getUserPosts.rejected", () => {
    // ARRANGE
    const state: PostState = { posts: [], loading: false, error: null };

    // ACT
    const result = postReducer(
      state,
      getUserPosts.rejected(
        null,
        "request-id-1",
        "user-1",
        "Failed to fetch posts",
      ),
    );

    // ASSERT
    expect(result.loading).toBe(false);
    expect(result.error).toBe("Failed to fetch posts");
  });
});

describe("deletePost async thunk", () => {
  it("should handle deletePost.pending", () => {
    // ARRANGE
    const state: PostState = { posts: [], loading: false, error: null };

    // ACT
    const result = postReducer(
      state,
      deletePost.pending("request-id-1", "post-1"),
    );

    // ASSERT
    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  it("should handle deletePost.fulfilled", () => {
    const state: PostState = {
      posts: [
        {
          _id: "post-1",
          caption: "Test",
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
        } as Post,
        {
          _id: "post-2",
          caption: "Test2",
          image: "https://example1.com/image.jpg",
          likes: [],
          likesCount: 0,
          commentsCount: 0,
          hashtag: [],
          user: {
            _id: "user-2",
            username: "testuser2",
            profilePicture: "",
            followers: [],
          },
          createdAt: "2024-01-15T10:00:00Z",
        } as Post,
      ],
      loading: false,
      error: null,
    };

    const result = postReducer(
      state,
      deletePost.fulfilled("post-1", "request-id-1", "post-1"),
    );

    expect(result.loading).toBe(false);
    expect(result.posts).toHaveLength(1);
    expect(result.posts[0]._id).toBe("post-2");
  });

  it("should handle deletePost.rejected", () => {
    // ARRANGE
    const state: PostState = { posts: [], loading: false, error: null };

    // ACT
    const result = postReducer(
      state,
      deletePost.rejected(
        null,
        "request-id-1",
        "user-1",
        "Failed to delete post",
      ),
    );

    // ASSERT
    expect(result.loading).toBe(false);
    expect(result.error).toBe("Failed to delete post");
  });
});

describe("getFeed async thunk", () => {
  it("should handle getFeed.pending", () => {
    // ARRANGE
    const state: PostState = { posts: [], loading: false, error: null };

    // ACT
    const result = postReducer(state, getFeed.pending("request-id-1", undefined));

    // ASSERT
    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  it("should handle getFeed.fulfilled", () => {
    // ARRANGE
    const state: PostState = { posts: [], loading: false, error: null };
    const mockPosts: Post[] = [
      {
        _id: "1",
        caption: "Feed Post",
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
    const result = postReducer(state, getFeed.fulfilled(mockPosts, "request-id-1", undefined));

    // ASSERT
    expect(result.loading).toBe(false);
    expect(result.posts).toHaveLength(1);
  });

  it("should handle getFeed.rejected", () => {
    // ARRANGE
    const state: PostState = { posts: [], loading: false, error: null };

    // ACT
    const result = postReducer(
      state,
      getFeed.rejected(null, "request-id-1", undefined, "Failed to fetch feed")
    );

    // ASSERT
    expect(result.loading).toBe(false);
    expect(result.error).toBe("Failed to fetch feed");
  });
});

describe("toggleLike async thunk", () => {
  it("should handle toggleLike.fulfilled", () => {
    // ARRANGE
    const state: PostState = { posts: [], loading: false, error: null };

    // ACT
    const result = postReducer(
      state,
      toggleLike.fulfilled({ postId: "post-1", data: { isLiked: true } }, "request-id-1", "post-1")
    );

    // ASSERT
    expect(result.loading).toBe(false);
  });
});

describe("getSavedPosts async thunk", () => {
  it("should handle getSavedPosts.pending", () => {
    // ARRANGE
    const state: PostState = { posts: [], loading: false, error: null };

    // ACT
    const result = postReducer(state, getSavedPosts.pending("request-id-1", undefined));

    // ASSERT
    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  it("should handle getSavedPosts.fulfilled", () => {
    // ARRANGE
    const state: PostState = { posts: [], loading: false, error: null };
    const mockPosts: Post[] = [
      {
        _id: "1",
        caption: "Saved Post",
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
    const result = postReducer(state, getSavedPosts.fulfilled(mockPosts, "request-id-1", undefined));

    // ASSERT
    expect(result.loading).toBe(false);
    expect(result.posts).toHaveLength(1);
  });

  it("should handle getSavedPosts.rejected", () => {
    // ARRANGE
    const state: PostState = { posts: [], loading: false, error: null };

    // ACT
    const result = postReducer(
      state,
      getSavedPosts.rejected(null, "request-id-1", undefined, "Failed to fetch saved posts")
    );

    // ASSERT
    expect(result.loading).toBe(false);
    expect(result.error).toBe("Failed to fetch saved posts");
  });
});

describe("createPost async thunk", () => {
  it("should handle createPost.pending", () => {
    // ARRANGE
    const state: PostState = { posts: [], loading: false, error: null };
    const formData = new FormData();

    // ACT
    const result = postReducer(state, createPost.pending("request-id-1", formData));

    // ASSERT
    expect(result.loading).toBe(true);
    expect(result.error).toBeNull();
  });

  it("should handle createPost.fulfilled", () => {
    // ARRANGE
    const state: PostState = { posts: [], loading: false, error: null };
    const formData = new FormData();
    const newPost: Post = {
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
    };

    // ACT
    const result = postReducer(state, createPost.fulfilled(newPost, "request-id-1", formData));

    // ASSERT
    expect(result.loading).toBe(false);
  });

  it("should handle createPost.rejected", () => {
    // ARRANGE
    const state: PostState = { posts: [], loading: false, error: null };
    const formData = new FormData();

    // ACT
    const result = postReducer(
      state,
      createPost.rejected(null, "request-id-1", formData, "Failed to create post")
    );

    // ASSERT
    expect(result.loading).toBe(false);
    expect(result.error).toBe("Failed to create post");
  });
});

describe("toggleSavePost async thunk", () => {
  it("should handle toggleSavePost.fulfilled", () => {
    // ARRANGE
    const state: PostState = { posts: [], loading: false, error: null };

    // ACT
    const result = postReducer(
      state,
      toggleSavePost.fulfilled({ postId: "post-1", data: { isSaved: true } }, "request-id-1", "post-1")
    );

    // ASSERT
    expect(result.loading).toBe(false);
  });
});
