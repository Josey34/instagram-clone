import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { addComment } from "@/store/slices/commentSlice";
import { addNotification } from "@/store/slices/notificationSlice";
import { Loader2 } from "lucide-react";
import { useState } from "react";

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
        <form onSubmit={handleSubmit} className="flex gap-2 items-center mt-4 pt-4">
            <Input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a comment..."
                disabled={isSubmitting}
                maxLength={500}
                className="flex-1"
            />
            <Button
                type="submit"
                disabled={!text.trim() || isSubmitting}
                size="sm"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Posting...
                    </>
                ) : (
                    "Post"
                )}
            </Button>
        </form>
    );
};

export default CommentInput;
