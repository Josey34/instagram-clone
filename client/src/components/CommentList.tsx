import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { deleteComment } from "../store/slices/commentSlice";
import { addNotification } from "../store/slices/notificationSlice";
import type { Comment } from "../types";

interface CommentListProps {
    comments: Comment[];
    loading: boolean;
    postOwnerId: string;
}

const CommentList = ({ comments, loading, postOwnerId }: CommentListProps) => {
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector((state) => state.auth.user);
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
    const [commentToDelete, setCommentToDelete] = useState<{ commentId: string; postId: string } | null>(null);

    const handleDeleteClick = (commentId: string, postId: string) => {
        setCommentToDelete({ commentId, postId });
    };

    const handleConfirmDelete = async () => {
        if (!commentToDelete) return;

        const { commentId, postId } = commentToDelete;
        setDeletingCommentId(commentId);
        setCommentToDelete(null);

        const result = await dispatch(deleteComment({ commentId, postId }));
        setDeletingCommentId(null);

        if (deleteComment.fulfilled.match(result)) {
            dispatch(
                addNotification({
                    message: "Comment deleted successfully",
                    type: "success",
                })
            );
        } else if (deleteComment.rejected.match(result)) {
            dispatch(
                addNotification({
                    message: (result.payload as string) || "Failed to delete comment",
                    type: "error",
                })
            );
        }
    };

    const handleCancelDelete = () => {
        setCommentToDelete(null);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-base-300" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-base-300 rounded w-1/4" />
                            <div className="h-3 bg-base-300 rounded w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (comments.length === 0) {
        return (
            <div className="text-center py-8 text-base-content/60">
                <p>No comments yet. Be the first to comment!</p>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {comments.map((comment) => {
                    const canDelete = currentUser && (
                        comment.user._id === currentUser._id ||
                        postOwnerId === currentUser._id
                    );

                    return (
                        <div key={comment._id} className="flex gap-3">
                            <Link to={`/profile/${comment.user.username}`}>
                                <div className="avatar">
                                    <div className="w-8 h-8 rounded-full">
                                        <img
                                            src={
                                                comment.user.profilePicture ||
                                                "https://via.placeholder.com/32"
                                            }
                                            alt={comment.user.username}
                                        />
                                    </div>
                                </div>
                            </Link>
                            <div className="flex-1">
                                <div className="flex items-baseline gap-2">
                                    <Link
                                        to={`/profile/${comment.user.username}`}
                                        className="font-semibold hover:underline"
                                    >
                                        {comment.user.username}
                                    </Link>
                                    <span className="text-xs text-base-content/60">
                                        {formatDistanceToNow(new Date(comment.createdAt), {
                                            addSuffix: true,
                                        })}
                                    </span>
                                </div>
                                <p className="text-sm mt-1">{comment.text}</p>
                            </div>
                            {canDelete && (
                                <button
                                    onClick={() => handleDeleteClick(comment._id, comment.post)}
                                    disabled={deletingCommentId === comment._id}
                                    className="btn btn-ghost btn-sm btn-circle text-error"
                                    title="Delete comment"
                                >
                                    {deletingCommentId === comment._id ? (
                                        <span className="loading loading-spinner loading-xs" />
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-4 h-4"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                            />
                                        </svg>
                                    )}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
            {commentToDelete && (
                <dialog open className="modal modal-open z-[9999]">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Delete Comment</h3>
                        <p className="py-4">Are you sure you want to delete this comment? This action cannot be undone.</p>
                        <div className="modal-action">
                            <button onClick={handleCancelDelete} className="btn">
                                Cancel
                            </button>
                            <button onClick={handleConfirmDelete} className="btn btn-error">
                                Delete
                            </button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button onClick={handleCancelDelete}>close</button>
                    </form>
                </dialog>
            )}
        </div>
    );
};

export default CommentList;
