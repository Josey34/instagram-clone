import { useSidebar } from "../contexts/SidebarContext";
import Sidebar from "./Sidebar";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const { isExpanded } = useSidebar();

    return (
        <div className="min-h-screen bg-base-200">
            <Sidebar />
            <main
                className={`pb-16 lg:pb-0 px-4 py-8 max-w-5xl transition-all duration-300 ${
                    isExpanded ? "lg:ml-64" : "lg:ml-20"
                }`}
            >
                {children}
            </main>
        </div>
    );
};

export default Layout;
