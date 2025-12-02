import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { addNotification } from "@/store/slices/notificationSlice";
import { searchUsers } from "@/store/slices/searchSlice";
import { toggleFollow } from "@/store/slices/userSlice";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SuggestionsCard = () => {
    const dispatch = useAppDispatch();
    const { user: currentUser } = useAppSelector((state) => state.auth);
    const { results: searchResults } = useAppSelector((state) => state.search);
    const [loadingFollow, setLoadingFollow] = useState<Record<string, boolean>>({});

    useEffect(() => {
        // Use a wildcard to get all users
        dispatch(searchUsers("u"));
    }, [dispatch]);

    const suggestedUsers = searchResults
        .filter((user) => {
            // Filter out current user
            if (user._id === currentUser?._id) return false;

            // Filter out users already following
            const isFollowing = currentUser?.following?.some(id => id === user._id);
            if (isFollowing) return false;

            return true;
        })
        .slice(0, 5);

    const handleFollow = async (userId: string, username: string) => {
        if (!currentUser) return;

        setLoadingFollow((prev) => ({ ...prev, [userId]: true }));

        const result = await dispatch(
            toggleFollow({
                userId: userId,
                currentUserId: currentUser._id,
            })
        );

        if (toggleFollow.fulfilled.match(result)) {
            dispatch(
                addNotification({
                    message: `Following @${username}`,
                    type: "success",
                })
            );
        }

        setLoadingFollow((prev) => ({ ...prev, [userId]: false }));
    };

    if (suggestedUsers.length === 0) {
        return null;
    }

    return (
        <Card className="top-4">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-muted-foreground text-sm">
                        Suggested for you
                    </h3>
                    <Link
                        to="/explore"
                        className="text-xs font-semibold hover:text-muted-foreground"
                    >
                        See All
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-4">
                {suggestedUsers.map((user) => (
                    <div key={user._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Link to={`/profile/${user.username}`}>
                                <Avatar className="w-10 h-10 flex-shrink-0">
                                    <AvatarImage
                                        src={user.profilePicture}
                                        alt={user.username}
                                        className="object-cover"
                                    />
                                    <AvatarFallback>
                                        {user.username[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </Link>
                            <div className="flex-1 min-w-0">
                                <Link
                                    to={`/profile/${user.username}`}
                                    className="font-semibold text-sm hover:underline block truncate"
                                >
                                    {user.username}
                                </Link>
                                <p className="text-xs text-muted-foreground truncate">
                                    Suggested for you
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => handleFollow(user._id, user.username)}
                            disabled={loadingFollow[user._id]}
                            size="sm"
                            variant="ghost"
                            className="text-primary hover:text-primary font-semibold text-xs h-auto p-0 hover:bg-transparent flex-shrink-0"
                        >
                            {loadingFollow[user._id] ? "Following..." : "Follow"}
                        </Button>
                    </div>
                ))}
            </CardContent>

            {/* Footer */}
            <div className="px-6 pb-4">
                <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex flex-wrap gap-1">
                        <Link to="#" className="hover:underline">About</Link>
                        <span>·</span>
                        <Link to="#" className="hover:underline">Help</Link>
                        <span>·</span>
                        <Link to="#" className="hover:underline">Press</Link>
                        <span>·</span>
                        <Link to="#" className="hover:underline">API</Link>
                        <span>·</span>
                        <Link to="#" className="hover:underline">Jobs</Link>
                        <span>·</span>
                        <Link to="#" className="hover:underline">Privacy</Link>
                        <span>·</span>
                        <Link to="#" className="hover:underline">Terms</Link>
                    </div>
                    <p className="text-muted-foreground">© 2025 INSTACLONE BY JOSEY</p>
                </div>
            </div>
        </Card>
    );
};

export default SuggestionsCard;
