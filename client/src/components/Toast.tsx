import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { removeNotification } from "../store/slices/notificationSlice";

const Toast = () => {
    const dispatch = useAppDispatch();
    const { notifications } = useAppSelector((state) => state.notification);

    useEffect(() => {
        if (notifications.length > 0) {
            const timer = setTimeout(() => {
                dispatch(removeNotification(notifications[0].id));
            }, 4000); // Auto-dismiss after 4 seconds

            return () => clearTimeout(timer);
        }
    }, [notifications, dispatch]);

    const getAlertClass = (type: string) => {
        switch (type) {
            case 'success':
                return 'alert-success';
            case 'error':
                return 'alert-error';
            case 'warning':
                return 'alert-warning';
            case 'info':
            default:
                return 'alert-info';
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'error':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                );
            case 'info':
            default:
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                );
        }
    };

    if (notifications.length === 0) return null;

    return (
        <div className="toast toast-top toast-end z-50">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`alert ${getAlertClass(notification.type)} shadow-lg`}
                >
                    {getIcon(notification.type)}
                    <span>{notification.message}</span>
                    <button
                        className="btn btn-sm btn-circle btn-ghost"
                        onClick={() => dispatch(removeNotification(notification.id))}
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
};

export default Toast;
