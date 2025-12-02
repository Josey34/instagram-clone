import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { getStories } from "@/store/slices/storySlice";
import type { Story } from "@/types";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import CreateStory from "./CreateStory";
import StoryViewer from "./StoryViewer";

// Group stories by user
interface GroupedStories {
    userId: string;
    username: string;
    profilePicture: string;
    stories: Story[];
    hasUnviewed: boolean;
}

const StoriesCarousel = () => {
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector((state) => state.auth.user);
    const { stories, loading } = useAppSelector((state) => state.story);

    const [viewerOpen, setViewerOpen] = useState(false);
    const [createStoryOpen, setCreateStoryOpen] = useState(false);
    const [selectedStories, setSelectedStories] = useState<Story[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Fetch stories on mount
    useEffect(() => {
        dispatch(getStories());
    }, [dispatch]);

    // Group stories by user
    const groupedStories: GroupedStories[] = [];
    const userStoriesMap = new Map<string, GroupedStories>();

    // Add safety check before forEach
    if (stories && Array.isArray(stories)) {
        stories.forEach((story) => {
            const userId = story.user._id;
            if (!userStoriesMap.has(userId)) {
                userStoriesMap.set(userId, {
                    userId,
                    username: story.user.username,
                    profilePicture: story.user.profilePicture,
                    stories: [],
                    hasUnviewed: false,
                });
            }
            const group = userStoriesMap.get(userId)!;
            group.stories.push(story);

            // Check if story is unviewed by current user
            if (currentUser && !story.viewedBy.includes(currentUser._id)) {
                group.hasUnviewed = true;
            }
        });

        userStoriesMap.forEach((group) => {
            groupedStories.push(group);
        });
    }

    // Check if current user has stories with safety check
    const currentUserStories =
        stories?.filter((story) => story.user._id === currentUser?._id) || [];
    const hasOwnStories = currentUserStories.length > 0;

    const handleStoryClick = (stories: Story[], index = 0) => {
        setSelectedStories(stories);
        setSelectedIndex(index);
        setViewerOpen(true);
    };

    const handleYourStoryClick = () => {
        if (hasOwnStories) {
            // View your own stories
            handleStoryClick(currentUserStories);
        } else {
            // Create new story
            setCreateStoryOpen(true);
        }
    };

    if (loading && (!stories || stories.length === 0)) {
        return (
            <div className="flex gap-4 p-4 overflow-x-auto">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        <div className="w-12 h-3 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <>
            <div className="flex gap-4 p-4 overflow-x-auto scrollbar-hide border-b">
                {/* Your Story */}
                <div
                    className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0"
                    onClick={handleYourStoryClick}
                >
                    <div className="relative">
                        <div
                            className={`p-[2px] rounded-full ${
                                hasOwnStories
                                    ? "bg-gradient-to-tr from-yellow-400 to-purple-600"
                                    : "bg-gray-300 dark:bg-gray-700"
                            }`}
                        >
                            <Avatar className="w-16 h-16 border-2 border-white dark:border-gray-900">
                                <AvatarImage
                                    src={
                                        currentUser?.profilePicture ||
                                        "https://via.placeholder.com/150"
                                    }
                                    alt={currentUser?.username}
                                />
                                <AvatarFallback>
                                    {currentUser?.username?.[0]?.toUpperCase() ||
                                        "U"}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        {!hasOwnStories && (
                            <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                                <Plus className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </div>
                    <span className="text-xs max-w-[70px] truncate">
                        {hasOwnStories ? "Your Story" : "Add Story"}
                    </span>
                </div>

                {/* Other users' stories */}
                {groupedStories
                    .filter((group) => group.userId !== currentUser?._id)
                    .map((group) => (
                        <div
                            key={group.userId}
                            className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0"
                            onClick={() => handleStoryClick(group.stories)}
                        >
                            <div
                                className={`p-[2px] rounded-full ${
                                    group.hasUnviewed
                                        ? "bg-gradient-to-tr from-yellow-400 to-purple-600"
                                        : "bg-gray-300 dark:bg-gray-600"
                                }`}
                            >
                                <Avatar className="w-16 h-16 border-2 border-white dark:border-gray-900">
                                    <AvatarImage
                                        src={
                                            group.profilePicture ||
                                            "https://via.placeholder.com/150"
                                        }
                                        alt={group.username}
                                    />
                                    <AvatarFallback>
                                        {group.username?.[0]?.toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <span className="text-xs max-w-[70px] truncate">
                                {group.username}
                            </span>
                        </div>
                    ))}
            </div>

            {/* Story Viewer */}
            {viewerOpen && (
                <StoryViewer
                    key={`${selectedStories[0]?._id}-${viewerOpen}`}
                    stories={selectedStories}
                    initialIndex={selectedIndex}
                    open={viewerOpen}
                    onOpenChange={setViewerOpen}
                />
            )}

            {/* Create Story Dialog */}
            <CreateStory
                open={createStoryOpen}
                onOpenChange={setCreateStoryOpen}
            />
        </>
    );
};

export default StoriesCarousel;
