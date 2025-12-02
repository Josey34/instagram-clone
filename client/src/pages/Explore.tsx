import Layout from "@/components/Layout";
import PostDetailModal from "@/components/PostDetaliModal";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { getExplorePosts } from "@/store/slices/postSlice";
import type { Post } from "@/types";
import { useEffect, useState } from "react";

const Explore = () => {
    const dispatch = useAppDispatch();
    const { posts, loading } = useAppSelector((state) => state.post);
    const [postModalOpen, setPostModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    useEffect(() => {
        dispatch(getExplorePosts());
    }, [dispatch]);

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                {loading ? (
                    <div className="grid grid-cols-3 gap-1 md:gap-4">
                        {[...Array(12)].map((_, i) => (
                            <Skeleton key={i} className="aspect-square" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-1 md:gap-4">
                        {posts.map((post: Post) => (
                            <div
                                key={post._id}
                                className="aspect-square overflow-hidden bg-muted cursor-pointer group relative"
                                onClick={() => {
                                        setSelectedPost(post);
                                        setPostModalOpen(true);
                                    }}
                            >
                                <img
                                    src={post.image}
                                    alt={post.caption}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                                    <div className="flex items-center gap-2 text-white font-semibold">
                                        <svg
                                            className="w-6 h-6"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                        </svg>
                                        {post.likesCount}
                                    </div>
                                    <div className="flex items-center gap-2 text-white font-semibold">
                                        <svg
                                            className="w-6 h-6"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223z"
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
            <PostDetailModal
                open={postModalOpen}
                onOpenChange={setPostModalOpen}
                post={selectedPost}
            />
        </Layout>
    );
};

export default Explore;
