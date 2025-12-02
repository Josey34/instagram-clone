import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { logout } from "@/store/slices/authSlice";
import { addNotification } from "@/store/slices/notificationSlice";
import { Lock, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    // Further development
    // const [showChangePassword, setShowChangePassword] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        dispatch(
            addNotification({
                message: "Logged out successfully",
                type: "success",
            })
        );
        navigate("/login");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                </DialogHeader>

                <div className="space-y-1">
                    {/* Change Password */}
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3"
                        disabled
                        onClick={() => {
                            // setShowChangePassword(true);
                            // We'll implement this next
                        }}
                    >
                        <Lock className="w-5 h-5" />
                        Change Password
                    </Button>

                    <Separator />

                    {/* Account Settings */}
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3"
                        disabled
                    >
                        <User className="w-5 h-5" />
                        Account Settings
                        <span className="ml-auto text-xs text-muted-foreground">
                            Coming soon
                        </span>
                    </Button>

                    <Separator />

                    {/* Logout */}
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SettingsDialog;
