import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { login } from "../../store/slices/authSlice";
import { addNotification } from "../../store/slices/notificationSlice";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const dispatch = useAppDispatch();
    const { loading, isAuthenticated } = useAppSelector(
        (state) => state.auth
    );

    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = await dispatch(login({ username, password }));

        if (login.fulfilled.match(result)) {
            dispatch(addNotification({
                message: "Login successful! Welcome back.",
                type: "success"
            }));
            navigate("/");
        } else if (login.rejected.match(result)) {
            dispatch(addNotification({
                message: result.payload as string || "Login failed. Please try again.",
                type: "error"
            }));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card w-full max-w-md bg-base-100 shadow-xl">
                <div className="card-body">
                    {/* Logo */}
                    <h2 className="card-title text-3xl font-bold justify-center mb-2">
                        Instagram
                    </h2>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Username</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="input input-bordered w-full"
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Password</span>
                            </label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="input input-bordered w-full"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full"
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner"></span>
                                    Logging in...
                                </>
                            ) : (
                                "Log In"
                            )}
                        </button>
                    </form>

                    {/* Link to Register */}
                    <div className="divider">OR</div>
                    <p className="text-center">
                        Don't have an account?{" "}
                        <Link to="/register" className="link link-primary">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
