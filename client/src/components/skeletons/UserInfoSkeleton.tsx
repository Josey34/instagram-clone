import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const UserInfoSkeleton = () => {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                    {/* Profile Picture Skeleton */}
                    <Skeleton className="w-32 h-32 rounded-full shrink-0" />

                    {/* User Details Skeleton */}
                    <div className="flex-1 w-full text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                            <Skeleton className="h-8 w-40" />
                            <Skeleton className="h-9 w-24" />
                        </div>

                        <Skeleton className="h-6 w-48 mb-2 mx-auto md:mx-0" />
                        <Skeleton className="h-4 w-64 mb-4 mx-auto md:mx-0" />

                        {/* Stats Skeleton */}
                        <div className="flex gap-8 justify-center md:justify-start">
                            <div className="flex flex-col items-center">
                                <Skeleton className="h-4 w-12 mb-2" />
                                <Skeleton className="h-10 w-16" />
                            </div>
                            <div className="flex flex-col items-center">
                                <Skeleton className="h-4 w-16 mb-2" />
                                <Skeleton className="h-10 w-16" />
                            </div>
                            <div className="flex flex-col items-center">
                                <Skeleton className="h-4 w-16 mb-2" />
                                <Skeleton className="h-10 w-16" />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default UserInfoSkeleton;
