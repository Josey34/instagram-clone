const UserInfoSkeleton = () => {
    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                    {/* Profile Picture Skeleton */}
                    <div className="skeleton w-32 h-32 rounded-full shrink-0"></div>

                    {/* User Details Skeleton */}
                    <div className="flex-1 w-full text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                            <div className="skeleton h-8 w-40"></div>
                            <div className="skeleton h-9 w-24"></div>
                        </div>

                        <div className="skeleton h-6 w-48 mb-2 mx-auto md:mx-0"></div>
                        <div className="skeleton h-4 w-64 mb-4 mx-auto md:mx-0"></div>

                        {/* Stats Skeleton */}
                        <div className="stats stats-horizontal shadow">
                            <div className="stat place-items-center">
                                <div className="skeleton h-4 w-12 mb-2"></div>
                                <div className="skeleton h-10 w-16"></div>
                            </div>
                            <div className="stat place-items-center">
                                <div className="skeleton h-4 w-16 mb-2"></div>
                                <div className="skeleton h-10 w-16"></div>
                            </div>
                            <div className="stat place-items-center">
                                <div className="skeleton h-4 w-16 mb-2"></div>
                                <div className="skeleton h-10 w-16"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserInfoSkeleton;