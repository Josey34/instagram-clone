import { useState } from "react";
import { useAppDispatch } from "../hooks/reduxHooks";
import { addComment } from "../store/slices/commentSlice";
import { addNotification } from "../store/slices/notificationSlice";

interface CommentInputProps {
    postId: string;
}

const CommentInput = ({ postId }: CommentInputProps) => {
    const dispatch = useAppDispatch();
    const [text, setText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!text.trim()) return;

        if (text.length > 500) {
            dispatch(
                addNotification({
                    message: "Comment must not exceed 500 characters",
                    type: "error",
                })
            );
            return;
        }

        setIsSubmitting(true);
        const result = await dispatch(addComment({ postId, text }));
        setIsSubmitting(false);

        if (addComment.fulfilled.match(result)) {
            setText("");
            dispatch(
                addNotification({
                    message: "Comment added successfully",
                    type: "success",
                })
            );
        } else if (addComment.rejected.match(result)) {
            dispatch(
                addNotification({
                    message: (result.payload as string) || "Failed to add comment",
                    type: "error",
                })
            );
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 items-center mt-4 pt-4 border-t border-base-300">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a comment..."
                className="input input-bordered flex-1 input-sm"
                disabled={isSubmitting}
                maxLength={500}
            />
            <button
                type="submit"
                disabled={!text.trim() || isSubmitting}
                className="btn btn-primary btn-sm"
            >
                {isSubmitting ? (
                    <span className="loading loading-spinner loading-xs" />
                ) : (
                    "Post"
                )}
            </button>
        </form>
    );
};

export default CommentInput;
