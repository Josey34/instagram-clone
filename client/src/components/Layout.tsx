import Navbar from "./Navbar";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="min-h-screen bg-base-200">
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        </div>
    );
};

export default Layout;
