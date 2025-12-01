import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { updateProfile } from "@/store/slices/authSlice";
import { addNotification } from "@/store/slices/notificationSlice";
import { getUserByUsername } from "@/store/slices/userSlice";
import { Camera } from "lucide-react";
import { useState } from "react";

interface EditProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const EditProfileDialog = ({ open, onOpenChange }: EditProfileDialogProps) => {
    const dispatch = useAppDispatch();
    const { user, loading } = useAppSelector((state) => state.auth);

    // Initialize state from user data - will reset when component remounts
    const [fullname, setFullname] = useState(user?.fullname || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState(user?.profilePicture || "");

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfilePicture(file);
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("fullname", fullname);
        formData.append("bio", bio);

        if (profilePicture) {
            formData.append("profilePicture", profilePicture);
        }

        const result = await dispatch(updateProfile(formData));

        if (updateProfile.fulfilled.match(result)) {
            dispatch(
                addNotification({
                    message: "Profile updated successfully",
                    type: "success",
                })
            );
            onOpenChange(false);

            // Refetch the profile user if on profile page
            if (user?.username) {
                dispatch(getUserByUsername(user.username));
            }
        } else {
            dispatch(
                addNotification({
                    message:
                        (result.payload as string) ||
                        "Failed to update profile",
                    type: "error",
                })
            );
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Picture */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <Avatar className="w-24 h-24">
                                <AvatarImage
                                    src={
                                        previewUrl ||
                                        "https://via.placeholder.com/150"
                                    }
                                    alt={user?.username}
                                />
                                <AvatarFallback>
                                    {user?.username[0].toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <label
                                htmlFor="profile-picture"
                                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90"
                            >
                                <Camera className="w-4 h-4" />
                                <input
                                    id="profile-picture"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Click the camera icon to change profile picture
                        </p>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-2">
                        <Label htmlFor="fullname">Full Name</Label>
                        <Input
                            id="fullname"
                            value={fullname}
                            onChange={(e) => setFullname(e.target.value)}
                            placeholder="Enter your full name"
                            maxLength={50}
                        />
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about yourself"
                            maxLength={150}
                            rows={3}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                            {bio.length}/150
                        </p>
                    </div>

                    {/* Username (readonly) */}
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            value={user?.username || ""}
                            disabled
                            className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                            Username cannot be changed
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditProfileDialog;
