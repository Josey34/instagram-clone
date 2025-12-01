import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { Heart, MessageCircle, Trash2 } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";

import { addNotification } from "@/store/slices/notificationSlice";
import { deletePost, toggleLike } from "@/store/slices/postSlice";

import { getComments } from "@/store/slices/commentSlice";
import type { Post } from "@/types";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import CommentInput from "./CommentInput";
import CommentList from "./CommentList";

interface PostDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    post: Post | null;
}

const PostDetailModal = ({
    open,
    onOpenChange,
    post,
}: PostDetailModalProps) => {
    const dispatch = useAppDispatch();
    const { user: currentUser } = useAppSelector((state) => state.auth);
    const { comments, loading: commentsLoading } = useAppSelector(
        (state) => state.comment
    );
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const postComments = post ? comments[post._id] || [] : [];

    useEffect(() => {
        if (post && open && !postComments.length) {
            dispatch(getComments(post._id));
        }
    }, [post, open, postComments.length, dispatch]);

    if (!post) return null;
    const isLiked = post.likes?.includes(currentUser?._id || "");

    const handleLike = async () => {
        const result = await dispatch(toggleLike(post._id));

        if (toggleLike.fulfilled.match(result)) {
            dispatch(
                addNotification({
                    message: isLiked ? "Unliked post" : "Liked post",
                    type: "success",
                })
            );
        }
    };

    const handleDelete = async () => {
        if (!post) return;

        const result = await dispatch(deletePost(post._id));

        if (deletePost.fulfilled.match(result)) {
            dispatch(
                addNotification({
                    message: "Post deleted successfully",
                    type: "success",
                })
            );
            onOpenChange(false); // Close the modal
        } else {
            dispatch(
                addNotification({
                    message:
                        (result.payload as string) || "Failed to delete post",
                    type: "error",
                })
            );
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTitle title={post.user?.username} />
            <DialogContent
                className="max-w-5xl h-[90vh] p-0 [&>button]:hidden"
                aria-describedby={undefined}
            >
                <div className="grid md:grid-cols-2 h-full">
                    {/* Image Section */}
                    <div className="bg-black flex items-center justify-center">
                        <img
                            src={post.image}
                            alt="Post"
                            className="max-h-full max-w-full object-contain"
                        />
                    </div>

                    {/* Details Section */}
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="p-4 border-b flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                    <AvatarImage
                                        src={
                                            post.user?.profilePicture ||
                                            "https://via.placeholder.com/150"
                                        }
                                        alt={post.user?.username}
                                    />
                                    <AvatarFallback>
                                        {post.user?.username[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="font-semibold">
                                    {post.user?.username}
                                </span>
                            </div>

                            {/* Delete button - only show for post owner */}
                            {currentUser?._id === post.user?._id && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="hover:bg-red-50 dark:hover:bg-red-950"
                                >
                                    <Trash2 className="w-5 h-5 text-red-600" />
                                </Button>
                            )}
                        </div>

                        {/* Caption & Comments */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {/* Caption */}
                            {post.caption && (
                                <div className="flex gap-3 mb-4">
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage
                                            src={
                                                post.user?.profilePicture ||
                                                "https://via.placeholder.com/150"
                                            }
                                            alt={post.user?.username}
                                        />
                                        <AvatarFallback>
                                            {post.user?.username[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <span className="font-semibold mr-2">
                                            {post.user?.username}
                                        </span>
                                        <span>{post.caption}</span>
                                    </div>
                                </div>
                            )}

                            {/* Comments */}
                            <CommentList
                                comments={postComments}
                                loading={commentsLoading}
                                postOwnerId={post.user._id}
                            />
                        </div>

                        {/* Actions */}
                        <div className="border-t p-4 space-y-2">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleLike}
                                >
                                    <Heart
                                        className={`w-6 h-6 ${
                                            isLiked
                                                ? "fill-red-500 text-red-500"
                                                : ""
                                        }`}
                                    />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <MessageCircle className="w-6 h-6" />
                                </Button>
                            </div>

                            <p className="text-sm font-semibold">
                                {post.likes?.length || 0} likes
                            </p>

                            <p className="text-xs text-muted-foreground">
                                {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                        </div>

                        {/* Comment Input */}
                        <div className="border-t p-4">
                            <CommentInput postId={post._id} />
                        </div>
                    </div>
                </div>
                {showDeleteConfirm && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-background p-6 rounded-lg max-w-sm mx-4">
                            <h3 className="text-lg font-semibold mb-2">
                                Delete Post?
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Are you sure you want to delete this post? This
                                action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDeleteConfirm(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default PostDetailModal;
