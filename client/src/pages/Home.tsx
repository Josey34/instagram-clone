import { useEffect } from "react";
import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import FeedSkeleton from "../components/skeletons/FeedSkeleton";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { getFeed } from "../store/slices/postSlice";

const Home = () => {
    const dispatch = useAppDispatch();
    const { posts, loading } = useAppSelector((state) => state.post);

    useEffect(() => {
        dispatch(getFeed());
    }, [dispatch]);

    return (
        <Layout>
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Feed</h1>

                {loading ? (
                    <FeedSkeleton count={3} />
                ) : posts.length === 0 ? (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body text-center py-12">
                            <p className="text-base-content/70 text-lg mb-4">
                                No posts in your feed yet
                            </p>
                            <p className="text-base-content/60">
                                Follow some users to see their posts here!
                            </p>
                        </div>
                    </div>
                ) : (
                    posts.map((post) => <PostCard key={post._id} post={post} />)
                )}
            </div>
        </Layout>
    );
};

export default Home;
