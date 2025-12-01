import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { removeNotification } from "../store/slices/notificationSlice";

const Alert = () => {
    const dispatch = useAppDispatch();
    const { notifications } = useAppSelector((state) => state.notification);

    useEffect(() => {
        if (notifications.length > 0) {
            const timer = setTimeout(() => {
                dispatch(removeNotification(notifications[0].id));
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [notifications, dispatch]);

    if (notifications.length === 0) return null;

    const notification = notifications[0];

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-background border rounded-lg px-4 py-2 shadow-lg animate-in slide-in-from-top-2 duration-300">
                <p className="text-sm font-medium">{notification.message}</p>
            </div>
        </div>
    );
};

export default Alert;
