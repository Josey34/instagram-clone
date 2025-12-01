import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { getFollowers, getFollowing } from "@/store/slices/followSlice";
import { addNotification } from "@/store/slices/notificationSlice";
import { toggleFollow } from "@/store/slices/userSlice";
import type { User } from "@/types";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "./ui/scroll-area";

interface FollowListModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    type: "followers" | "following";
}

const FollowListModal = ({
    open,
    onOpenChange,
    userId,
    type,
}: FollowListModalProps) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const { followers, following, loading } = useAppSelector(
        (state) => state.follow
    );
    const { user: currentUser } = useAppSelector((state) => state.auth);

    const users = type === "followers" ? followers : following;

    useEffect(() => {
        if (open && userId) {
            if (type === "followers") {
                dispatch(getFollowers(userId));
            } else {
                dispatch(getFollowing(userId));
            }
        }
    }, [open, userId, type, dispatch]);

    const handleUserClick = (username: string) => {
        navigate(`/profile/${username}`);
        onOpenChange(false);
    };

    const handleFollowToggle = async (user: User) => {
        if (!currentUser) return;

        const result = await dispatch(
            toggleFollow({
                userId: user._id,
                currentUserId: currentUser._id,
            })
        );

        if (toggleFollow.fulfilled.match(result)) {
            const isFollowing = user.followers.includes(currentUser._id);
            dispatch(
                addNotification({
                    message: isFollowing
                        ? `Unfollowed @${user.username}`
                        : `Following @${user.username}`,
                    type: isFollowing ? "info" : "success",
                })
            );

            // Refresh the list
            if (type === "followers") {
                dispatch(getFollowers(userId));
            } else {
                dispatch(getFollowing(userId));
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {type === "followers" ? "Followers" : "Following"}
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="h-[400px] pr-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <p className="text-muted-foreground">Loading...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex justify-center py-8">
                            <p className="text-muted-foreground">
                                No{" "}
                                {type === "followers"
                                    ? "followers"
                                    : "following"}{" "}
                                yet
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {users.map((user) => {
                                const isOwnProfile =
                                    currentUser?._id === user._id;
                                const isFollowing = user.followers?.includes(
                                    currentUser?._id || ""
                                );

                                return (
                                    <div
                                        key={user._id}
                                        className="flex items-center justify-between"
                                    >
                                        <div
                                            className="flex items-center gap-3 flex-1 cursor-pointer"
                                            onClick={() =>
                                                handleUserClick(user.username)
                                            }
                                        >
                                            <Avatar className="w-12 h-12">
                                                <AvatarImage
                                                    src={
                                                        user.profilePicture ||
                                                        "https://via.placeholder.com/150"
                                                    }
                                                    alt={user.username}
                                                />
                                                <AvatarFallback>
                                                    {user.username[0].toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">
                                                    {user.username}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {user.fullname}
                                                </p>
                                            </div>
                                        </div>

                                        {!isOwnProfile && (
                                            <Button
                                                size="sm"
                                                variant={
                                                    isFollowing
                                                        ? "secondary"
                                                        : "default"
                                                }
                                                onClick={() =>
                                                    handleFollowToggle(user)
                                                }
                                            >
                                                {isFollowing
                                                    ? "Following"
                                                    : "Follow"}
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default FollowListModal;
