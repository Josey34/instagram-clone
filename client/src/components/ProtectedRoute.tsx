import { Navigate } from "react-router-dom";
import { useAppSelector } from "../hooks/reduxHooks";
import Loading from "./Loading";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

    // Show nothing while checking authentication
    if (loading) {
        return <Loading fullScreen />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Render children if authenticated
    return <>{children}</>;
};

export default ProtectedRoute;
