import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { deleteComment } from "@/store/slices/commentSlice";
import { addNotification } from "@/store/slices/notificationSlice";
import type { Comment } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";

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
                        <div className="w-8 h-8 rounded-full bg-muted" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-1/4" />
                            <div className="h-3 bg-muted rounded w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (comments.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
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
                                <Avatar className="h-8 w-8">
                                    <AvatarImage
                                        src={comment.user.profilePicture || "https://via.placeholder.com/32"}
                                        alt={comment.user.username}
                                    />
                                    <AvatarFallback>{comment.user.username[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </Link>
                            <div className="flex-1">
                                <div className="flex items-baseline gap-2">
                                    <Link
                                        to={`/profile/${comment.user.username}`}
                                        className="font-semibold hover:underline"
                                    >
                                        {comment.user.username}
                                    </Link>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(comment.createdAt), {
                                            addSuffix: true,
                                        })}
                                    </span>
                                </div>
                                <p className="text-sm mt-1">{comment.text}</p>
                            </div>
                            {canDelete && (
                                <Button
                                    onClick={() => handleDeleteClick(comment._id, comment.post)}
                                    disabled={deletingCommentId === comment._id}
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    title="Delete comment"
                                >
                                    {deletingCommentId === comment._id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </Button>
                            )}
                        </div>
                    );
                })}
            </div>
            <AlertDialog open={!!commentToDelete} onOpenChange={(open) => !open && handleCancelDelete()}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this comment? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default CommentList;
