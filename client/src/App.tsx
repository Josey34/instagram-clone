import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { SidebarProvider } from "./contexts/SidebarContext";
import { useAppDispatch, useAppSelector } from "./hooks/reduxHooks";
import { getCurrentUser } from "./store/slices/authSlice";

import ProtectedRoute from "./components/ProtectedRoute";
import ThemeToggle from "./components/ThemeToggle";

import Alert from "./components/Alert";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Explore from "./pages/Explore";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Search from "./pages/Search";

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
                <Alert />
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
                    <Route
                        path="/search"
                        element={
                            <ProtectedRoute>
                                <Search />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/explore"
                        element={
                            <ProtectedRoute>
                                <Explore />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </SidebarProvider>
        </BrowserRouter>
    );
}

export default App;
