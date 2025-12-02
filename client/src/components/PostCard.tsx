import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { cn } from "@/lib/utils";
import { getComments } from "@/store/slices/commentSlice";
import { addNotification } from "@/store/slices/notificationSlice";
import { toggleLike, toggleSavePost } from "@/store/slices/postSlice";
import type { Post } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CommentInput from "./CommentInput";
import CommentList from "./CommentList";

interface PostCardProps {
    post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
    const dispatch = useAppDispatch();
    const { user: currentUser } = useAppSelector((state) => state.auth);
    const { comments, loading: commentsLoading } = useAppSelector((state) => state.comment);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showHeartPop, setShowHeartPop] = useState(false);
    const [showComments, setShowComments] = useState(false);

    const isLiked = currentUser ? post.likes.includes(currentUser._id) : false;
    const isSaved = currentUser?.savedPosts?.includes(post._id) || false;
    const postComments = comments[post._id] || [];

    const handleLike = () => {
        setIsAnimating(true);
        dispatch(toggleLike(post._id));
        setTimeout(() => setIsAnimating(false), 600);
    };

    const handleSavePost = async () => {
        const result = await dispatch(toggleSavePost(post._id));
        if (toggleSavePost.fulfilled.match(result)) {
            dispatch(
                addNotification({
                    message: result.payload.data.isSaved ? "Post saved" : "Post unsaved",
                    type: "success",
                })
            );
        }
    };
    
    const handleDoubleClick = () => {
        // Only like if not already liked
        if (!isLiked) {
            handleLike();
        }
        // Show heart pop animation regardless
        setShowHeartPop(true);
        setTimeout(() => setShowHeartPop(false), 1000);
    };

    const handleCommentClick = () => {
        setShowComments(true);
        if (!postComments.length) {
            dispatch(getComments(post._id));
        }
    };

    // Fetch comments when modal opens
    useEffect(() => {
        if (showComments && !postComments.length) {
            dispatch(getComments(post._id));
        }
    }, [showComments, postComments.length, dispatch, post._id]);

    // Format number to K/M format like Instagram
    const formatCount = (count: number): string => {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (count >= 1000) {
            return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        return count.toString();
    };

    return (
        <Card className="mb-6">
            {/* Post Header */}
            <div className="flex items-center gap-3 p-4">
                <Link to={`/profile/${post.user.username}`}>
                    <Avatar>
                        <AvatarImage
                            src={post.user.profilePicture || "https://via.placeholder.com/40"}
                            alt={post.user.username}
                        />
                        <AvatarFallback>{post.user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                </Link>
                <div className="flex-1">
                    <Link
                        to={`/profile/${post.user.username}`}
                        className="font-semibold hover:underline flex items-center gap-1"
                    >
                        {post.user.username}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                        })}
                    </p>
                </div>
                {/* Three-dot menu */}
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                        />
                    </svg>
                </Button>
            </div>

            {/* Post Image */}
            <figure className="relative select-none" onDoubleClick={handleDoubleClick}>
                <img
                    src={post.image}
                    alt={post.caption}
                    className="w-full object-cover max-h-[600px] cursor-pointer"
                />

                {/* Large heart animation on double click */}
                {showHeartPop && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-24 h-24 text-white drop-shadow-2xl animate-heart-pop"
                            style={{
                                animation: 'heartPop 1s ease-out forwards'
                            }}
                        >
                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                        </svg>
                    </div>
                )}
            </figure>

            {/* Post Actions */}
            <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4 -ml-2">
                        {/* Like Button */}
                        <div className="flex items-center">
                            <Button
                                onClick={handleLike}
                                variant="ghost"
                                size="icon"
                                className="relative overflow-visible h-12 w-12 hover:bg-transparent p-0"
                                aria-label={isLiked ? "Unlike" : "Like"}
                            >
                                {isLiked ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className={cn(
                                            "w-7 h-7 text-destructive transition-all duration-300",
                                            isAnimating ? "scale-125 animate-pulse" : "scale-100"
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
                                            "w-7 h-7 transition-all duration-300",
                                            isAnimating ? "scale-110" : "scale-100"
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
                                        <span className="absolute w-12 h-12 bg-destructive/30 rounded-full animate-ping" />
                                    </span>
                                )}
                            </Button>
                            <span className="font-semibold text-sm">
                                {formatCount(post.likesCount)}
                            </span>
                        </div>

                        {/* Comment Button */}
                        <div className="flex items-center">
                            <Button
                                onClick={handleCommentClick}
                                variant="ghost"
                                size="icon"
                                className="h-12 w-12 hover:bg-transparent p-0"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-7 h-7"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
                                    />
                                </svg>
                            </Button>
                            <span className="font-semibold text-sm">
                                {formatCount(post.commentsCount)}
                            </span>
                        </div>
                    </div>

                    {/* Bookmark Button */}
                    <Button
                        onClick={handleSavePost}
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 hover:bg-transparent p-0 -mr-2"
                        aria-label={isSaved ? "Unsave post" : "Save post"}
                    >
                        {isSaved ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-7 h-7"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-7 h-7"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                                />
                            </svg>
                        )}
                    </Button>
                </div>

                {/* Caption */}
                {post.caption && (
                    <p className="mt-2">
                        <Link
                            to={`/profile/${post.user.username}`}
                            className="font-semibold hover:underline mr-2"
                        >
                            {post.user.username}
                        </Link>
                        {post.caption}
                    </p>
                )}

                {/* Hashtags */}
                {post.hashtag && post.hashtag.length > 0 && (
                    <p className="text-primary mt-1">
                        {post.hashtag.map((tag) => `#${tag}`).join(" ")}
                    </p>
                )}
            </CardContent>

            {/* Comments Dialog */}
            <Dialog open={showComments} onOpenChange={setShowComments}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Comments</DialogTitle>
                    </DialogHeader>
                    <CommentList
                        comments={postComments}
                        loading={commentsLoading}
                        postOwnerId={post.user._id}
                    />
                    <CommentInput postId={post._id} />
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default PostCard;
