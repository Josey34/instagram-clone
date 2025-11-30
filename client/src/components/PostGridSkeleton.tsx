interface PostGridSkeletonProps {
    count?: number;
}

const PostGridSkeleton = ({ count = 6 }: PostGridSkeletonProps) => {
    return (
        <div className="grid grid-cols-3 gap-1 md:gap-4">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="aspect-square rounded-lg skeleton"
                ></div>
            ))}
        </div>
    );
};

export default PostGridSkeleton;
