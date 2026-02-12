import { describe, expect, it } from 'vitest';
import type { User, UserState } from '../../types';
import userReducer, {
  clearProfileUser,
  getUserByUsername,
  toggleFollow,
} from './userSlice';

describe('userSlice', () => {
  const initialState: UserState = {
    profileUser: null,
    loading: false,
    error: null,
  };

  const mockUser: User = {
    _id: 'user-1',
    username: 'testuser',
    fullname: 'Test User',
    email: 'test@example.com',
    profilePicture: 'https://example.com/pic.jpg',
    bio: 'Test bio',
    followers: ['follower-1', 'follower-2'],
    following: ['following-1'],
    followersCount: 2,
    followingCount: 1,
    postsCount: 10,
  };

  // INITIAL STATE
  it('should return initial state', () => {
    // ARRANGE & ACT
    const state = userReducer(undefined, { type: 'unknown' });

    // ASSERT
    expect(state.profileUser).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  // CLEAR PROFILE USER
  it('should clear profile user and error', () => {
    // ARRANGE
    const stateWithData: UserState = {
      profileUser: mockUser,
      loading: false,
      error: 'Some error',
    };

    // ACT
    const newState = userReducer(stateWithData, clearProfileUser());

    // ASSERT
    expect(newState.profileUser).toBeNull();
    expect(newState.error).toBeNull();
  });

  // GET USER BY USERNAME
  describe('getUserByUsername async thunk', () => {
    it('should handle getUserByUsername.pending', () => {
      // ARRANGE
      const state = initialState;

      // ACT
      const newState = userReducer(
        state,
        getUserByUsername.pending('request-id-1', 'testuser')
      );

      // ASSERT
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should handle getUserByUsername.fulfilled', () => {
      // ARRANGE
      const state = initialState;

      // ACT
      const newState = userReducer(
        state,
        getUserByUsername.fulfilled(mockUser, 'request-id-1', 'testuser')
      );

      // ASSERT
      expect(newState.loading).toBe(false);
      expect(newState.profileUser).toBeDefined();
      expect(newState.profileUser?.username).toBe('testuser');
    });

    it('should handle getUserByUsername.rejected', () => {
      // ARRANGE
      const state = initialState;

      // ACT
      const newState = userReducer(
        state,
        getUserByUsername.rejected(
          null,
          'request-id-1',
          'testuser',
          'Failed to fetch user'
        )
      );

      // ASSERT
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe('Failed to fetch user');
    });
  });

  // TOGGLE FOLLOW
  describe('toggleFollow async thunk', () => {
    it('should handle toggleFollow.pending', () => {
      // ARRANGE
      const state = initialState;

      // ACT
      const newState = userReducer(
        state,
        toggleFollow.pending('request-id-1', {
          userId: 'user-1',
          currentUserId: 'current-user',
        })
      );

      // ASSERT
      expect(newState.error).toBeNull();
    });

    it('should handle toggleFollow.fulfilled when following', () => {
      // ARRANGE
      const stateWithUser: UserState = {
        profileUser: mockUser,
        loading: false,
        error: null,
      };

      // ACT
      const newState = userReducer(
        stateWithUser,
        toggleFollow.fulfilled(
          {
            message: 'Followed successfully',
            currentUserId: 'current-user',
          },
          'request-id-1',
          { userId: 'user-1', currentUserId: 'current-user' }
        )
      );

      // ASSERT
      expect(newState.loading).toBe(false);
      expect(newState.profileUser?.followers).toContain('current-user');
      expect(newState.profileUser?.followersCount).toBe(3);
    });

    it('should handle toggleFollow.fulfilled when unfollowing', () => {
      // ARRANGE
      const stateWithUser: UserState = {
        profileUser: {
          ...mockUser,
          followers: ['current-user', 'follower-2'],
          followersCount: 2,
        },
        loading: false,
        error: null,
      };

      // ACT
      const newState = userReducer(
        stateWithUser,
        toggleFollow.fulfilled(
          {
            message: 'Unfollowed successfully',
            currentUserId: 'current-user',
          },
          'request-id-1',
          { userId: 'user-1', currentUserId: 'current-user' }
        )
      );

      // ASSERT
      expect(newState.loading).toBe(false);
      expect(newState.profileUser?.followers).not.toContain('current-user');
      expect(newState.profileUser?.followersCount).toBe(1);
    });

    it('should handle toggleFollow.fulfilled with no profileUser', () => {
      // ARRANGE
      const state = initialState;

      // ACT
      const newState = userReducer(
        state,
        toggleFollow.fulfilled(
          {
            message: 'Followed successfully',
            currentUserId: 'current-user',
          },
          'request-id-1',
          { userId: 'user-1', currentUserId: 'current-user' }
        )
      );

      // ASSERT
      expect(newState.profileUser).toBeNull();
      expect(newState.loading).toBe(false);
    });

    it('should handle toggleFollow.rejected', () => {
      // ARRANGE
      const state = initialState;

      // ACT
      const newState = userReducer(
        state,
        toggleFollow.rejected(
          null,
          'request-id-1',
          { userId: 'user-1', currentUserId: 'current-user' },
          'Failed to toggle follow'
        )
      );

      // ASSERT
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe('Failed to toggle follow');
    });
  });
});
