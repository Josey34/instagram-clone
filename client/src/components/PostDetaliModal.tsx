import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { addNotification } from "@/store/slices/notificationSlice";
import { toggleLike } from "@/store/slices/postSlice";
import type { Post } from "@/types";
import { Heart, MessageCircle } from "lucide-react";
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
    const { comments, loading: commentsLoading } = useAppSelector((state) => state.comment);
    
    if (!post) return null;
    
    const postComments = comments[post._id] || [];
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl h-[90vh] p-0">
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
                        <div className="p-4 border-b flex items-center gap-3">
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
            </DialogContent>
        </Dialog>
    );
};

export default PostDetailModal;
