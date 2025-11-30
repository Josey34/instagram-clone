import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import PostGridSkeleton from "../../components/skeletons/PostGridSkeleton";
import UserInfoSkeleton from "../../components/skeletons/UserInfoSkeleton";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { addNotification } from "../../store/slices/notificationSlice";
import { getUserPosts } from "../../store/slices/postSlice";
import { getUserByUsername, toggleFollow } from "../../store/slices/userSlice";
import type { Post } from "../../types";

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
    }, [profileUser, dispatch]);

    const isOwnProfile = currentUser?.username === username;
    const isFollowing = currentUser?.following.includes(profileUser?._id || "");

    const handleFollowToggle = async () => {
        if (!profileUser) return;

        const result = await dispatch(toggleFollow(profileUser._id));

        if (toggleFollow.fulfilled.match(result)) {
            dispatch(
                addNotification({
                    message: isFollowing
                        ? `Unfollowed @${profileUser.username}`
                        : `Following @${profileUser.username}`,
                    type: isFollowing ? "info" : "success",
                })
            );
        } else if (toggleFollow.rejected.match(result)) {
            // Show the actual error message from the backend
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

    if (userLoading || !profileUser) {
        return (
            <Layout>
                <div className="space-y-6">
                    <UserInfoSkeleton />
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h3 className="card-title mb-4">Posts</h3>
                            <PostGridSkeleton count={9} />
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* User Info Section */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                            {/* Profile Picture */}
                            <div className="avatar">
                                <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                    <img
                                        src={
                                            profileUser.profilePicture ||
                                            "https://via.placeholder.com/150"
                                        }
                                        alt={profileUser.username}
                                    />
                                </div>
                            </div>

                            {/* User Details */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                                    <h2 className="text-2xl font-bold">
                                        @{profileUser.username}
                                    </h2>

                                    {!isOwnProfile && (
                                        <button
                                            onClick={handleFollowToggle}
                                            className={`btn btn-sm ${
                                                isFollowing
                                                    ? "btn-outline"
                                                    : "btn-primary"
                                            }`}
                                        >
                                            {isFollowing
                                                ? "Unfollow"
                                                : "Follow"}
                                        </button>
                                    )}

                                    {isOwnProfile && (
                                        <button className="btn btn-sm btn-outline">
                                            Edit Profile
                                        </button>
                                    )}
                                </div>

                                <h3 className="text-lg font-semibold mb-2">
                                    {profileUser.fullname}
                                </h3>
                                <p className="text-base-content/70 mb-4">
                                    {profileUser.bio || "No bio yet"}
                                </p>

                                {/* Stats */}
                                <div className="stats stats-horizontal shadow">
                                    <div className="stat place-items-center">
                                        <div className="stat-title">Posts</div>
                                        <div className="stat-value text-primary">
                                            {profileUser.postsCount}
                                        </div>
                                    </div>
                                    <div className="stat place-items-center">
                                        <div className="stat-title">
                                            Followers
                                        </div>
                                        <div className="stat-value text-secondary">
                                            {profileUser.followersCount}
                                        </div>
                                    </div>
                                    <div className="stat place-items-center">
                                        <div className="stat-title">
                                            Following
                                        </div>
                                        <div className="stat-value text-accent">
                                            {profileUser.followingCount}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Posts Grid Section */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h3 className="card-title mb-4">Posts</h3>

                        {postsLoading ? (
                            <PostGridSkeleton count={9} />
                        ) : posts.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-base-content/70">
                                    No posts yet
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-1 md:gap-4">
                                {posts.map((post: Post) => (
                                    <div
                                        key={post._id}
                                        className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                    >
                                        <img
                                            src={post.image}
                                            alt={post.caption}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
