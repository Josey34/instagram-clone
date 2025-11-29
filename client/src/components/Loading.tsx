interface LoadingProps {
    size?: "sm" | "md" | "lg";
    fullScreen?: boolean;
}

const Loading = ({ size = "lg", fullScreen = false }: LoadingProps) => {
    const sizeClass = {
        sm: "loading-sm",
        md: "loading-md",
        lg: "loading-lg",
    }[size];

    if (fullScreen) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <span className={`loading loading-spinner ${sizeClass}`}></span>
            </div>
        );
    }

    return (
        <div className="flex justify-center py-8">
            <span className={`loading loading-spinner ${sizeClass}`}></span>
        </div>
    );
};

export default Loading;
