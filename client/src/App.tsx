import { useEffect, useState } from "react";
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

// Test function with SonarQube issues
function testFEFunction() {
    var apiKey = "sk-1234567890"; // Hardcoded secret - security issue
    var unusedVar1 = "unused"; // unused variable
    var unusedVar2 = "unused"; // unused variable

    if (apiKey == "sk-1234567890") { // == instead of === - code smell
        console.log("API Key is exposed");
    }

    // Duplicate logic - code smell
    if (apiKey == "sk-1234567890") {
        console.log("API Key is exposed");
    }

    return apiKey;
}

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
