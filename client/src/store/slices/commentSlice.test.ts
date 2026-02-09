import { describe, expect, it } from 'vitest';
import type { Comment, CommentState } from '../../types';
import commentReducer, {
  addComment,
  clearComments,
  deleteComment,
  getComments,
} from './commentSlice';

describe('commentSlice', () => {
  const initialState: CommentState = {
    comments: {},
    loading: false,
    error: null,
  };

  // INITIAL STATE
  it('should return initial state', () => {
    // ARRANGE & ACT
    const state = commentReducer(undefined, { type: 'unknown' });

    // ASSERT
    expect(state.comments).toEqual({});
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  // CLEAR COMMENTS - All
  it('should clear all comments', () => {
    // ARRANGE
    const stateWithComments: CommentState = {
      comments: {
        'post-1': [{ _id: '1', text: 'Comment 1' } as Comment],
        'post-2': [{ _id: '2', text: 'Comment 2' } as Comment],
      },
      loading: false,
      error: null,
    };

    // ACT
    const newState = commentReducer(stateWithComments, clearComments(''));

    // ASSERT
    expect(newState.comments).toEqual({});
  });

  // CLEAR COMMENTS - Specific Post
  it('should clear comments for specific post', () => {
    // ARRANGE
    const stateWithComments: CommentState = {
      comments: {
        'post-1': [{ _id: '1', text: 'Comment 1' } as Comment],
        'post-2': [{ _id: '2', text: 'Comment 2' } as Comment],
      },
      loading: false,
      error: null,
    };

    // ACT
    const newState = commentReducer(stateWithComments, clearComments('post-1'));

    // ASSERT
    expect(newState.comments['post-1']).toBeUndefined();
    expect(newState.comments['post-2']).toBeDefined();
  });

  // GET COMMENTS
  describe('getComments async thunk', () => {
    it('should handle getComments.pending', () => {
      // ARRANGE
      const state = initialState;

      // ACT
      const newState = commentReducer(
        state,
        getComments.pending('request-id-1', 'post-1')
      );

      // ASSERT
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should handle getComments.fulfilled', () => {
      // ARRANGE
      const state = initialState;
      const mockComments: Comment[] = [
        { _id: '1', text: 'Comment 1', user: {} } as Comment,
        { _id: '2', text: 'Comment 2', user: {} } as Comment,
      ];

      // ACT
      const newState = commentReducer(
        state,
        getComments.fulfilled(
          { postId: 'post-1', comments: mockComments },
          'request-id-1',
          'post-1'
        )
      );

      // ASSERT
      expect(newState.loading).toBe(false);
      expect(newState.comments['post-1']).toHaveLength(2);
      expect(newState.comments['post-1'][0].text).toBe('Comment 1');
    });

    it('should handle getComments.rejected', () => {
      // ARRANGE
      const state = initialState;

      // ACT
      const newState = commentReducer(
        state,
        getComments.rejected(
          null,
          'request-id-1',
          'post-1',
          'Failed to fetch comments'
        )
      );

      // ASSERT
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe('Failed to fetch comments');
    });
  });

  // ADD COMMENT
  describe('addComment async thunk', () => {
    it('should handle addComment.pending', () => {
      // ARRANGE
      const state = initialState;

      // ACT
      const newState = commentReducer(
        state,
        addComment.pending('request-id-1', { postId: 'post-1', text: 'New comment' })
      );

      // ASSERT
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should handle addComment.fulfilled when comments exist', () => {
      // ARRANGE
      const stateWithComments: CommentState = {
        comments: {
          'post-1': [{ _id: '1', text: 'Existing comment' } as Comment],
        },
        loading: false,
        error: null,
      };
      const newComment: Comment = {
        _id: '2',
        text: 'New comment',
        user: {},
      } as Comment;

      // ACT
      const newState = commentReducer(
        stateWithComments,
        addComment.fulfilled(
          { postId: 'post-1', comment: newComment },
          'request-id-1',
          { postId: 'post-1', text: 'New comment' }
        )
      );

      // ASSERT
      expect(newState.loading).toBe(false);
      expect(newState.comments['post-1']).toHaveLength(2);
      expect(newState.comments['post-1'][0]._id).toBe('2');
    });

    it('should handle addComment.fulfilled when no comments exist yet', () => {
      // ARRANGE
      const state = initialState;
      const newComment: Comment = {
        _id: '1',
        text: 'First comment',
        user: {},
      } as Comment;

      // ACT
      const newState = commentReducer(
        state,
        addComment.fulfilled(
          { postId: 'post-1', comment: newComment },
          'request-id-1',
          { postId: 'post-1', text: 'First comment' }
        )
      );

      // ASSERT
      expect(newState.loading).toBe(false);
      expect(newState.comments['post-1']).toHaveLength(1);
      expect(newState.comments['post-1'][0].text).toBe('First comment');
    });

    it('should handle addComment.rejected', () => {
      // ARRANGE
      const state = initialState;

      // ACT
      const newState = commentReducer(
        state,
        addComment.rejected(
          null,
          'request-id-1',
          { postId: 'post-1', text: 'New comment' },
          'Failed to add comment'
        )
      );

      // ASSERT
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe('Failed to add comment');
    });
  });

  // DELETE COMMENT
  describe('deleteComment async thunk', () => {
    it('should handle deleteComment.fulfilled', () => {
      // ARRANGE
      const stateWithComments: CommentState = {
        comments: {
          'post-1': [
            { _id: '1', text: 'Comment 1' } as Comment,
            { _id: '2', text: 'Comment 2' } as Comment,
          ],
        },
        loading: false,
        error: null,
      };

      // ACT
      const newState = commentReducer(
        stateWithComments,
        deleteComment.fulfilled(
          { commentId: '1', postId: 'post-1' },
          'request-id-1',
          { commentId: '1', postId: 'post-1' }
        )
      );

      // ASSERT
      expect(newState.comments['post-1']).toHaveLength(1);
      expect(newState.comments['post-1'][0]._id).toBe('2');
    });

    it('should handle deleteComment.fulfilled when post has no comments', () => {
      // ARRANGE
      const state = initialState;

      // ACT
      const newState = commentReducer(
        state,
        deleteComment.fulfilled(
          { commentId: '1', postId: 'post-1' },
          'request-id-1',
          { commentId: '1', postId: 'post-1' }
        )
      );

      // ASSERT
      expect(newState.comments['post-1']).toBeUndefined();
    });
  });
});
