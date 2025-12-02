import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { addNotification } from "@/store/slices/notificationSlice";
import { createStory } from "@/store/slices/storySlice";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

interface CreateStoryProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const CreateStory = ({ open, onOpenChange }: CreateStoryProps) => {
    const dispatch = useAppDispatch();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
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

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                dispatch(
                    addNotification({
                        message: "Image size should be less than 5MB",
                        type: "error",
                    })
                );
                return;
            }

            setSelectedFile(file);

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);

        const formData = new FormData();
        formData.append("image", selectedFile);

        const result = await dispatch(createStory(formData));

        setIsUploading(false);

        if (createStory.fulfilled.match(result)) {
            dispatch(
                addNotification({
                    message: "Story created successfully",
                    type: "success",
                })
            );
            handleClose();
        } else {
            dispatch(
                addNotification({
                    message:
                        (result.payload as string) || "Failed to create story",
                    type: "error",
                })
            );
        }
    };

    const handleClose = () => {
        handleRemoveFile();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create Story</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* File input (hidden) */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {/* Preview or Upload area */}
                    {previewUrl ? (
                        <div className="relative">
                            <img
                                src={previewUrl}
                                alt="Story preview"
                                className="w-full h-[400px] object-cover rounded-lg"
                            />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={handleRemoveFile}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <div
                            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Click to upload an image
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                Maximum file size: 5MB
                            </p>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={!selectedFile || isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Share Story
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreateStory;
