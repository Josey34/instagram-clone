import StoriesCarousel from "@/components/StoriesCarousel";
import SuggestionsCard from "@/components/SuggestionsCard";
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
            <div className="max-w-[630px] xl:max-w-none mx-auto px-4">
                <div className="flex gap-8 justify-center xl:max-w-[1000px] xl:mx-auto">
                    <div className="w-full xl:w-[630px] flex-shrink-0">
                        <StoriesCarousel />
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
                            posts.map((post) => (
                                <PostCard key={post._id} post={post} />
                            ))
                        )}
                    </div>

                    <div className="hidden xl:block w-[320px] flex-shrink-0">
                        <SuggestionsCard />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Home;
