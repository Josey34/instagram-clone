import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { addNotification } from "@/store/slices/notificationSlice";
import { createPost } from "@/store/slices/postSlice";
import { Hash, ImagePlus, X } from "lucide-react";
import { useState, useMemo } from "react";

interface CreatePostProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const CreatePost = ({ open, onOpenChange }: CreatePostProps) => {
    const dispatch = useAppDispatch();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [caption, setCaption] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    // Extract hashtags from caption
    const hashtags = useMemo(() => {
        const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
        return caption.match(hashtagRegex) || [];
    }, [caption]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            dispatch(
                addNotification({
                    message: "Please select an image file",
                    type: "error",
                })
            );
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            dispatch(
                addNotification({
                    message: "Image size must be less than 5MB",
                    type: "error",
                })
            );
            return;
        }

        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setSelectedFile(null);
        setPreviewUrl("");
    };

    const handleClose = () => {
        setSelectedFile(null);
        setPreviewUrl("");
        setCaption("");
        onOpenChange(false);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            dispatch(
                addNotification({
                    message: "Please select an image",
                    type: "error",
                })
            );
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append("image", selectedFile);
        formData.append("caption", caption);

        const result = await dispatch(createPost(formData));

        setIsUploading(false);

        if (createPost.fulfilled.match(result)) {
            dispatch(
                addNotification({
                    message: "Post created successfully",
                    type: "success",
                })
            );
            handleClose();
        } else {
            dispatch(
                addNotification({
                    message: (result.payload as string) || "Failed to create post",
                    type: "error",
                })
            );
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Post</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Image Upload Area */}
                    {!previewUrl ? (
                        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <ImagePlus className="w-12 h-12 mb-3 text-gray-400" />
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    PNG, JPG or JPEG (MAX. 5MB)
                                </p>
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                        </label>
                    ) : (
                        <div className="relative">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-full h-auto max-h-96 object-contain rounded-lg"
                            />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={handleRemoveImage}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    )}

                    {/* Caption Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Caption (Optional)
                        </label>
                        <Textarea
                            placeholder="Write a caption... Use #hashtags to make your post discoverable!"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            rows={4}
                            maxLength={2200}
                            className="resize-none"
                        />
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                                {caption.length}/2200 characters
                            </p>
                            {hashtags.length > 0 && (
                                <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                                    <Hash className="w-3 h-3" />
                                    <span>{hashtags.length} hashtag{hashtags.length > 1 ? 's' : ''}</span>
                                </div>
                            )}
                        </div>
                        {hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {hashtags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFile || isUploading}
                        >
                            {isUploading ? "Uploading..." : "Share"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreatePost;
