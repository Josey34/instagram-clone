import Sidebar from "./Sidebar";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <main className="pb-16 lg:pb-0 px-4 py-8 max-w-3xl mx-auto">
                {children}
            </main>
        </div>
    );
};

export default Layout;
