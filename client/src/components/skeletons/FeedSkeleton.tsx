import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface FeedSkeletonProps {
    count?: number;
}

const FeedSkeleton = ({ count = 3 }: FeedSkeletonProps) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <Card key={index} className="mb-6">
                    {/* Header Skeleton */}
                    <div className="flex items-center gap-3 p-4">
                        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                        <div className="flex-1">
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    </div>

                    {/* Image Skeleton */}
                    <Skeleton className="w-full h-96 rounded-none" />

                    {/* Content Skeleton */}
                    <CardContent className="pt-4">
                        <div className="flex items-center gap-4 mb-4">
                            <Skeleton className="w-6 h-6 rounded-full" />
                            <Skeleton className="w-6 h-6 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                </Card>
            ))}
        </>
    );
};

export default FeedSkeleton;
