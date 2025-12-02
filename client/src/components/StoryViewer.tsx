import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { getTimeAgo } from "@/lib/utils";
import { addNotification } from "@/store/slices/notificationSlice";
import { deleteStory, viewStory } from "@/store/slices/storySlice";
import type { Story } from "@/types";
import { ChevronLeft, ChevronRight, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface StoryViewerProps {
    stories: Story[];
    initialIndex?: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const STORY_DURATION = 5000; // 5 seconds per story

const StoryViewer = ({
    stories,
    initialIndex = 0,
    open,
    onOpenChange,
}: StoryViewerProps) => {
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector((state) => state.auth.user);

    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isPaused, setIsPaused] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const animationFrameRef = useRef<number | null>(null);

    const currentStory = stories[currentIndex];

    const handleNext = () => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onOpenChange(false);
        }
    };

    // Mark story as viewed
    useEffect(() => {
        if (currentStory && open) {
            dispatch(viewStory(currentStory._id));
        }
    }, [currentStory?._id, dispatch, open]);

    // Progress animation using requestAnimationFrame for smoother performance
    useEffect(() => {
        if (!open || isPaused || !currentStory) return;

        // Cancel any existing animation
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        // Small delay to ensure DOM is ready
        const timeoutId = setTimeout(() => {
            const progressBar = document.getElementById(`progress-${currentStory._id}`);
            if (!progressBar) return;

            // Reset width immediately
            progressBar.style.width = '0%';

            const startTime = Date.now();

            const animate = () => {
                const progressBar = document.getElementById(`progress-${currentStory._id}`);
                if (!progressBar) return;

                const elapsed = Date.now() - startTime;
                const progress = Math.min((elapsed / STORY_DURATION) * 100, 100);

                progressBar.style.width = `${progress}%`;

                if (progress >= 100) {
                    // Move to next story
                    if (currentIndex < stories.length - 1) {
                        setCurrentIndex(currentIndex + 1);
                    } else {
                        onOpenChange(false);
                    }
                } else {
                    animationFrameRef.current = requestAnimationFrame(animate);
                }
            };

            animationFrameRef.current = requestAnimationFrame(animate);
        }, 10);

        return () => {
            clearTimeout(timeoutId);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [currentIndex, isPaused, open, currentStory, stories.length, onOpenChange]);

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!currentStory) return;

        setShowDeleteConfirm(false);

        const result = await dispatch(deleteStory(currentStory._id));

        if (deleteStory.fulfilled.match(result)) {
            dispatch(
                addNotification({
                    message: "Story deleted successfully",
                    type: "success",
                })
            );

            // Move to next story or close if it was the last one
            if (stories.length > 1) {
                if (currentIndex >= stories.length - 1) {
                    setCurrentIndex(Math.max(0, currentIndex - 1));
                }
            } else {
                onOpenChange(false);
            }
        } else {
            dispatch(
                addNotification({
                    message: "Failed to delete story",
                    type: "error",
                })
            );
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;

        // Click on left third = previous, right third = next
        if (x < width / 3) {
            handlePrevious();
        } else if (x > (width * 2) / 3) {
            handleNext();
        }
    };

    if (!currentStory) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md h-[90vh] p-0 bg-black [&>button]:hidden">
                <div className="relative w-full h-full flex flex-col">
                    {/* Progress bars */}
                    <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
                        {stories.map((story, index) => (
                            <div
                                key={story._id}
                                className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
                            >
                                <div
                                    id={index === currentIndex ? `progress-${story._id}` : undefined}
                                    className="h-full bg-white"
                                    style={{
                                        width:
                                            index < currentIndex
                                                ? "100%"
                                                : index === currentIndex
                                                ? "0%"
                                                : "0%",
                                        transition: index !== currentIndex ? "width 0.1s linear" : "none",
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Header */}
                    <div className="absolute top-4 left-0 right-0 z-20 flex items-center justify-between px-4 mt-3">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border-2 border-white">
                                <AvatarImage
                                    src={
                                        currentStory.user?.profilePicture ||
                                        "https://via.placeholder.com/150"
                                    }
                                    alt={currentStory.user?.username}
                                />
                                <AvatarFallback className="bg-gray-500 text-white">
                                    {currentStory.user?.username[0].toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-white font-semibold drop-shadow-lg">
                                {currentStory.user?.username}
                            </span>
                            <span className="text-white/70 text-sm drop-shadow-lg">
                                {getTimeAgo(currentStory.createdAt)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Delete button - only for own stories */}
                            {currentUser?._id === currentStory.user?._id && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleDeleteClick}
                                    className="text-white hover:bg-white/20"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            )}

                            {/* Close button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onOpenChange(false)}
                                className="text-white hover:bg-white/20"
                            >
                                <X className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>

                    {/* Story Image - clickable for navigation */}
                    <div
                        className="flex-1 flex items-center justify-center cursor-pointer"
                        onClick={handleClick}
                        onMouseDown={() => setIsPaused(true)}
                        onMouseUp={() => setIsPaused(false)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        <img
                            src={currentStory.image}
                            alt="Story"
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>

                    {/* Navigation hints (optional - shows on hover) */}
                    <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                        {currentIndex > 0 && (
                            <div className="pointer-events-auto">
                                <ChevronLeft className="w-8 h-8 text-white drop-shadow-lg" />
                            </div>
                        )}
                        {currentIndex < stories.length - 1 && (
                            <div className="pointer-events-auto ml-auto">
                                <ChevronRight className="w-8 h-8 text-white drop-shadow-lg" />
                            </div>
                        )}
                    </div>
                </div>
                {showDeleteConfirm && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
                            <h3 className="text-lg font-semibold mb-2">
                                Delete Story?
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                Are you sure you want to delete this story? This
                                action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={handleDeleteCancel}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteConfirm}
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

export default StoryViewer;
