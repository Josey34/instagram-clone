import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { cn } from "@/lib/utils";
import { getComments } from "@/store/slices/commentSlice";
import { toggleLike } from "@/store/slices/postSlice";
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
    const postComments = comments[post._id] || [];

    const handleLike = () => {
        setIsAnimating(true);
        dispatch(toggleLike(post._id));
        setTimeout(() => setIsAnimating(false), 600);
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
                        className="font-semibold hover:underline"
                    >
                        {post.user.username}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                        })}
                    </p>
                </div>
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
                <div className="flex items-center gap-4 mb-2">
                    {/* Like Button */}
                    <div className="flex items-center gap-1">
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
                                        "w-6 h-6 transition-all duration-300",
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
                                    <span className="absolute w-8 h-8 bg-destructive/30 rounded-full animate-ping" />
                                </span>
                            )}
                        </Button>
                        <span className="font-semibold text-sm transition-all duration-300">
                            <span className={isAnimating ? "scale-110 inline-block" : "inline-block"}>
                                {post.likesCount}
                            </span>
                        </span>
                    </div>

                    {/* Comment Button */}
                    <div className="flex items-center gap-1">
                        <Button
                            onClick={handleCommentClick}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                        >
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
                                    d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
                                />
                            </svg>
                        </Button>
                        <span className="font-semibold text-sm">
                            {post.commentsCount}
                        </span>
                    </div>
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

                {/* Comments Count */}
                {post.commentsCount > 0 && (
                    <Button
                        onClick={handleCommentClick}
                        variant="ghost"
                        className="text-muted-foreground text-sm h-auto p-0 hover:underline mt-2"
                    >
                        View all {post.commentsCount} comments
                    </Button>
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
