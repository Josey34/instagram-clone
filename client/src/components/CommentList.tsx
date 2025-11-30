import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import type { Comment } from "../types";

interface CommentListProps {
    comments: Comment[];
    loading: boolean;
}

const CommentList = ({ comments, loading }: CommentListProps) => {
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
        <div className="space-y-4 max-h-96 overflow-y-auto">
            {comments.map((comment) => (
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
                </div>
            ))}
        </div>
    );
};

export default CommentList;
