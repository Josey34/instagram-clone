import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ThemeToggle from "./components/ThemeToggle";
import Toast from "./components/Toast";
import { SidebarProvider } from "./contexts/SidebarContext";
import { useAppDispatch, useAppSelector } from "./hooks/reduxHooks";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/Home";
import Profile from "./pages/profile/Profile";
import { getCurrentUser } from "./store/slices/authSlice";

function App() {
    const dispatch = useAppDispatch();
    const { token, user } = useAppSelector((state) => state.auth);

    useEffect(() => {
        // If there's a token but no user, fetch the current user
        if (token && !user) {
            dispatch(getCurrentUser());
        }
    }, [token, user, dispatch]);

    return (
        <BrowserRouter>
            <SidebarProvider>
                <Toast />
                <ThemeToggle />
                <Routes>
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/profile/:username"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </SidebarProvider>
        </BrowserRouter>
    );
}

export default App;
