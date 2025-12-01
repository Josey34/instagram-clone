import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { MessageCircle, Trash2 } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";

import { addNotification } from "@/store/slices/notificationSlice";
import { deletePost, toggleLike } from "@/store/slices/postSlice";

import { cn } from "@/lib/utils";
import { getComments } from "@/store/slices/commentSlice";
import { toggleFollow } from "@/store/slices/userSlice";
import type { Post } from "@/types";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useEffect, useMemo, useState } from "react";
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
    const { posts } = useAppSelector((state) => state.post);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [localFollowState, setLocalFollowState] = useState<boolean | null>(
        null
    );
    const [isAnimating, setIsAnimating] = useState(false);

    const postComments = post ? comments[post._id] || [] : [];
    const updatedPost = posts.find((p) => p._id === post?._id) || post;
    const isLiked = currentUser
        ? updatedPost?.likes.includes(currentUser._id)
        : false;

    const initialFollowState = useMemo(() => {
        if (post && currentUser) {
            return post.user.followers?.includes(currentUser._id) || false;
        }
        return false;
    }, [post, currentUser]);

    const isFollowing =
        localFollowState !== null ? localFollowState : initialFollowState;

    useEffect(() => {
        if (post && open && !postComments.length) {
            dispatch(getComments(post._id));
        }
    }, [post, open, postComments.length, dispatch]);

    if (!post) return null;

    const handleLike = () => {
        setIsAnimating(true);
        dispatch(toggleLike(post._id));
        setTimeout(() => setIsAnimating(false), 600);
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

    const handleFollowToggle = async (userId: string) => {
        const result = await dispatch(
            toggleFollow({
                userId,
                currentUserId: currentUser?._id || "",
            })
        );

        if (toggleFollow.fulfilled.match(result)) {
            // Update local state immediately
            setLocalFollowState(!isFollowing);

            dispatch(
                addNotification({
                    message: isFollowing ? "Unfollowed" : "Following",
                    type: "success",
                })
            );
        }
    };

    return (
        <Dialog key={post?._id} open={open} onOpenChange={onOpenChange}>
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

                            {/* Follow/Unfollow Button */}
                            {currentUser?._id !== post.user?._id && (
                                <Button
                                    onClick={() =>
                                        handleFollowToggle(post.user._id)
                                    }
                                    variant={
                                        isFollowing ? "secondary" : "default"
                                    }
                                    size="sm"
                                >
                                    {isFollowing ? "Following" : "Follow"}
                                </Button>
                            )}

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
                                    onClick={handleLike}
                                    variant="ghost"
                                    size="icon"
                                    className="relative overflow-visible h-8 w-8"
                                    aria-label={isLiked ? "Unlike" : "Like"}
                                >
                                    {isLiked ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className={cn(
                                                "w-6 h-6 text-destructive transition-all duration-300",
                                                isAnimating
                                                    ? "scale-125 animate-pulse"
                                                    : "scale-100"
                                            )}
                                        >
                                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className={cn(
                                                "w-6 h-6 transition-all duration-300",
                                                isAnimating
                                                    ? "scale-110"
                                                    : "scale-100"
                                            )}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                                            />
                                        </svg>
                                    )}

                                    {/* Animated heart burst effect when liking */}
                                    {isAnimating && isLiked && (
                                        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="absolute w-8 h-8 bg-destructive/30 rounded-full animate-ping" />
                                        </span>
                                    )}
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
