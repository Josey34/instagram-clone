import { useEffect } from "react";
import Layout from "../components/Layout";
import Loading from "../components/Loading";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { getCurrentUser } from "../store/slices/authSlice";

const Home = () => {
    const dispatch = useAppDispatch();
    const { user, loading } = useAppSelector((state) => state.auth);

    useEffect(() => {
        // Fetch current user data if not already loaded
        if (!user) {
            dispatch(getCurrentUser());
        }
    }, [dispatch, user]);

    if (loading) {
        return (
            <Layout>
                <Loading />
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">
                    Welcome to Instagram Clone
                </h1>

                {user && (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">
                                Hello, {user.fullname}!
                            </h2>
                            <p className="text-base-content/70">@{user.username}</p>
                            <p className="text-base-content/70">{user.email}</p>

                            <div className="stats stats-horizontal shadow mt-4">
                                <div className="stat">
                                    <div className="stat-title">Posts</div>
                                    <div className="stat-value text-primary">{user.postsCount}</div>
                                </div>

                                <div className="stat">
                                    <div className="stat-title">Followers</div>
                                    <div className="stat-value text-secondary">{user.followersCount}</div>
                                </div>

                                <div className="stat">
                                    <div className="stat-title">Following</div>
                                    <div className="stat-value text-accent">{user.followingCount}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h3 className="card-title">Feed</h3>
                        <p className="text-base-content/70">
                            No posts yet. Start following people to see their posts!
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Home;
