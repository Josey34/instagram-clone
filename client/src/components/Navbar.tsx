import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { logout } from "../store/slices/authSlice";
import { addNotification } from "../store/slices/notificationSlice";

const Navbar = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        dispatch(addNotification({
            message: "You have been logged out successfully.",
            type: "info"
        }));
        navigate("/login");
    };

    return (
        <div className="navbar bg-base-100 border-b sticky top-0 z-50 shadow-sm">
            <div className="navbar-start">
                <Link to="/" className="btn btn-ghost text-xl font-bold">
                    Instagram
                </Link>
            </div>

            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to={`/profile/${user?.username}`}>Profile</Link>
                    </li>
                </ul>
            </div>

            <div className="navbar-end gap-2">
                <div className="dropdown dropdown-end lg:hidden">
                    <label tabIndex={0} className="btn btn-ghost btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
                    </label>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to={`/profile/${user?.username}`}>Profile</Link></li>
                    </ul>
                </div>

                <button
                    onClick={handleLogout}
                    className="btn btn-error btn-sm"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Navbar;
