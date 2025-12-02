import { useSidebar } from "@/contexts/SidebarContext";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { cn } from "@/lib/utils";
import { logout } from "@/store/slices/authSlice";
import { addNotification } from "@/store/slices/notificationSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import CreatePost from "./CreatePost";

const Sidebar = () => {
    const { isExpanded, setIsExpanded } = useSidebar();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAppSelector((state) => state.auth);
    const [createPostOpen, setCreatePostOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        dispatch(
            addNotification({
                message: "You have been logged out successfully.",
                type: "info",
            })
        );
        navigate("/login");
    };

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    const navItems = [
        {
            name: "Home",
            path: "/",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 min-w-6"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                    />
                </svg>
            ),
        },
        {
            name: "Search",
            path: "/search",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 min-w-6"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                </svg>
            ),
        },
        {
            name: "Explore",
            path: "/explore",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 min-w-6"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.091z"
                    />
                </svg>
            ),
        },
        {
            name: "Create",
            path: null,
            onClick: () => setCreatePostOpen(true),
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 min-w-6"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            ),
        },
        {
            name: "Profile",
            path: `/profile/${user?.username}`,
            icon: (
                <Avatar className="w-6 h-6 min-w-6 rounded-full overflow-hidden">
                    <AvatarImage
                        src={
                            user?.profilePicture ||
                            "https://via.placeholder.com/150"
                        }
                        alt={user?.username}
                        className="object-cover w-full h-full rounded-full"
                    />
                    <AvatarFallback className="rounded-full">
                        {user?.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                </Avatar>
            ),
        },
    ];

    return (
        <>
            {/* Desktop Sidebar - Collapsible */}
            <div
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
                className={cn(
                    "hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-card border-r border-border p-4 z-40 transition-all duration-300 ease-in-out",
                    isExpanded ? "w-64" : "w-20"
                )}
            >
                {/* Logo */}
                <Link to="/" className="mb-8 px-3 py-2 overflow-hidden">
                    {isExpanded ? (
                        <span className="text-2xl font-bold">InstaClone</span>
                    ) : (
                        <span className="text-2xl">📷</span>
                    )}
                </Link>

                {/* Navigation Items */}
                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        item.path ? (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-4 px-3 py-3 rounded-lg transition-all",
                                    isActive(item.path)
                                        ? "bg-secondary font-semibold"
                                        : "hover:bg-secondary/50"
                                )}
                            >
                                {item.icon}
                                {isExpanded && (
                                    <span className="text-base whitespace-nowrap">
                                        {item.name}
                                    </span>
                                )}
                            </Link>
                        ) : (
                            <button
                                key={item.name}
                                onClick={item.onClick}
                                className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-secondary/50 transition-all w-full text-left"
                            >
                                {item.icon}
                                {isExpanded && (
                                    <span className="text-base whitespace-nowrap">
                                        {item.name}
                                    </span>
                                )}
                            </button>
                        )
                    ))}
                </nav>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-secondary/50 transition-all w-full text-left mt-auto"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 min-w-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                        />
                    </svg>
                    {isExpanded && (
                        <span className="text-base whitespace-nowrap">
                            Logout
                        </span>
                    )}
                </button>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
                <div className="flex justify-around items-center h-16 px-4">
                    {navItems.map((item) => (
                        item.path ? (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
                                    isActive(item.path)
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                )}
                            >
                                {item.icon}
                            </Link>
                        ) : (
                            <button
                                key={item.name}
                                onClick={item.onClick}
                                className="flex flex-col items-center justify-center p-2 rounded-lg text-muted-foreground"
                            >
                                {item.icon}
                            </button>
                        )
                    ))}

                    <button
                        onClick={handleLogout}
                        className="flex flex-col items-center justify-center p-2 rounded-lg text-muted-foreground"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Create Post Dialog */}
            <CreatePost
                open={createPostOpen}
                onOpenChange={setCreatePostOpen}
            />
        </>
    );
};

export default Sidebar;
