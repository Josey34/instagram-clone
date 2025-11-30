interface FeedSkeletonProps {
    count?: number;
}

const FeedSkeleton = ({ count = 3 }: FeedSkeletonProps) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="card bg-base-100 shadow-xl mb-6">
                    {/* Header Skeleton */}
                    <div className="flex items-center gap-3 p-4">
                        <div className="skeleton w-10 h-10 rounded-full shrink-0"></div>
                        <div className="flex-1">
                            <div className="skeleton h-4 w-24 mb-2"></div>
                            <div className="skeleton h-3 w-16"></div>
                        </div>
                    </div>

                    {/* Image Skeleton */}
                    <div className="skeleton w-full h-96"></div>

                    {/* Content Skeleton */}
                    <div className="card-body">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="skeleton w-6 h-6 rounded-full"></div>
                            <div className="skeleton w-6 h-6 rounded-full"></div>
                        </div>
                        <div className="skeleton h-4 w-20 mb-2"></div>
                        <div className="skeleton h-4 w-full mb-2"></div>
                        <div className="skeleton h-4 w-3/4"></div>
                    </div>
                </div>
            ))}
        </>
    );
};

export default FeedSkeleton;
