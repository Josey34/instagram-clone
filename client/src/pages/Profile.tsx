import EditProfileDialog from "@/components/EditProfileDialog";
import FollowListModal from "@/components/FollowListModal";
import Layout from "@/components/Layout";
import PostGridSkeleton from "@/components/skeletons/PostGridSkeleton";
import UserInfoSkeleton from "@/components/skeletons/UserInfoSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { addNotification } from "@/store/slices/notificationSlice";
import { getUserPosts } from "@/store/slices/postSlice";
import { getUserByUsername, toggleFollow } from "@/store/slices/userSlice";
import type { Post } from "@/types";
import { Grid3x3, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Profile = () => {
    const { username } = useParams<{ username: string }>();
    const dispatch = useAppDispatch();

    const { user: currentUser } = useAppSelector((state) => state.auth);
    const { profileUser, loading: userLoading } = useAppSelector(
        (state) => state.user
    );
    const { posts, loading: postsLoading } = useAppSelector(
        (state) => state.post
    );
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [followModalOpen, setFollowModalOpen] = useState(false);
    const [followModalType, setFollowModalType] = useState<
        "followers" | "following"
    >("followers");

    useEffect(() => {
        if (username) {
            dispatch(getUserByUsername(username));
        }
    }, [username, dispatch]);

    // Fetch posts when profileUser is loaded
    useEffect(() => {
        if (profileUser) {
            dispatch(getUserPosts(profileUser._id));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileUser?._id, dispatch]);

    const isOwnProfile = currentUser?.username === username;
    const isFollowing = profileUser?.followers.includes(currentUser?._id || "");

    const handleFollowToggle = async () => {
        if (!profileUser || !username) return;

        const result = await dispatch(
            toggleFollow({
                userId: profileUser._id,
                currentUserId: currentUser?._id || "",
            })
        );

        if (toggleFollow.fulfilled.match(result)) {
            // Refetch the user to get updated counts
            await dispatch(getUserByUsername(username));

            dispatch(
                addNotification({
                    message: isFollowing
                        ? `Unfollowed @${profileUser.username}`
                        : `Following @${profileUser.username}`,
                    type: isFollowing ? "info" : "success",
                })
            );
        } else if (toggleFollow.rejected.match(result)) {
            dispatch(
                addNotification({
                    message:
                        (result.payload as string) ||
                        "Failed to update follow status",
                    type: "error",
                })
            );
        }
    };

    if (!profileUser) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto space-y-8">
                    <UserInfoSkeleton />
                    <div className="mt-12">
                        <PostGridSkeleton count={9} />
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                {/* Header Section - Instagram Style */}
                <div className="mb-11">
                    <div className="flex gap-8 md:gap-28 items-start mb-11">
                        {/* Profile Picture */}
                        <div className="ml-4 md:ml-20">
                            <Avatar className="w-20 h-20 md:w-36 md:h-36">
                                <AvatarImage
                                    src={
                                        profileUser.profilePicture ||
                                        "https://via.placeholder.com/150"
                                    }
                                    alt={profileUser.username}
                                />
                                <AvatarFallback className="text-3xl">
                                    {profileUser.username[0].toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            {/* Username and Actions */}
                            <div className="flex items-center gap-5 mb-5">
                                <h2 className="text-xl font-light">
                                    {profileUser.username}
                                </h2>

                                {!isOwnProfile && (
                                    <Button
                                        onClick={handleFollowToggle}
                                        variant={
                                            isFollowing
                                                ? "secondary"
                                                : "default"
                                        }
                                        size="sm"
                                        className="font-semibold"
                                    >
                                        {isFollowing ? "Following" : "Follow"}
                                    </Button>
                                )}

                                {isOwnProfile && (
                                    <>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="font-semibold"
                                            onClick={() =>
                                                setIsEditDialogOpen(true)
                                            }
                                        >
                                            Edit profile
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                            <Settings className="h-5 w-5" />
                                        </Button>
                                    </>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="flex gap-10 mb-5 text-base">
                                <div>
                                    <span className="font-semibold">
                                        {profileUser.postsCount}
                                    </span>{" "}
                                    <span className="text-muted-foreground">
                                        posts
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        setFollowModalType("followers");
                                        setFollowModalOpen(true);
                                    }}
                                    className="hover:text-muted-foreground transition-colors"
                                >
                                    <span className="font-semibold">
                                        {profileUser.followersCount}
                                    </span>{" "}
                                    <span className="text-muted-foreground">
                                        followers
                                    </span>
                                </button>
                                <button
                                    onClick={() => {
                                        setFollowModalType("following");
                                        setFollowModalOpen(true);
                                    }}
                                    className="hover:text-muted-foreground transition-colors"
                                >
                                    <span className="font-semibold">
                                        {profileUser.followingCount}
                                    </span>{" "}
                                    <span className="text-muted-foreground">
                                        following
                                    </span>
                                </button>
                            </div>

                            {/* Bio */}
                            <div className="text-sm">
                                <p className="font-semibold mb-1">
                                    {profileUser.fullname}
                                </p>
                                <p className="whitespace-pre-wrap">
                                    {profileUser.bio || ""}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="mb-0" />

                {/* Tabs Section */}
                <div className="flex justify-center border-t">
                    <button className="flex items-center gap-2 px-6 py-4 -mt-px border-t border-foreground text-xs font-semibold tracking-wider">
                        <Grid3x3 className="h-3 w-3" />
                        POSTS
                    </button>
                </div>

                {/* Posts Grid */}
                <div className="mt-3">
                    {postsLoading ? (
                        <PostGridSkeleton count={9} />
                    ) : posts.length === 0 ? (
                        <Card className="p-16 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-foreground mb-6">
                                <Grid3x3 className="h-8 w-8" />
                            </div>
                            <h3 className="text-3xl font-bold mb-2">
                                No Posts Yet
                            </h3>
                            <p className="text-muted-foreground">
                                {isOwnProfile
                                    ? "Share your first photo"
                                    : "When this user posts, you'll see their photos here."}
                            </p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-3 gap-1 md:gap-4">
                            {posts.map((post: Post) => (
                                <div
                                    key={post._id}
                                    className="aspect-square overflow-hidden bg-muted cursor-pointer group relative"
                                >
                                    <img
                                        src={post.image}
                                        alt={post.caption}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Hover overlay with stats */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                                        <div className="flex items-center gap-2 text-white font-semibold">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                className="w-6 h-6"
                                            >
                                                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                            </svg>
                                            {post.likesCount}
                                        </div>
                                        <div className="flex items-center gap-2 text-white font-semibold">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                className="w-6 h-6"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {post.commentsCount}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <EditProfileDialog
                key={isEditDialogOpen ? "open" : "closed"}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
            />
            <FollowListModal
                open={followModalOpen}
                onOpenChange={setFollowModalOpen}
                userId={profileUser._id}
                type={followModalType}
            />
        </Layout>
    );
};

export default Profile;
