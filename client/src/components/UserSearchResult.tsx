import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import type { User } from "@/types";
import { useNavigate } from "react-router-dom";

interface UserSearchResultProps {
    user: User;
}

const UserSearchResult = ({ user }: UserSearchResultProps) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/profile/${user.username}`);
    };

    return (
        <Card
            onClick={handleClick}
            className="flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
        >
            <Avatar className="w-12 h-12">
                <AvatarImage
                    src={
                        user.profilePicture || "https://via.placeholder.com/150"
                    }
                    alt={user.username}
                />
                <AvatarFallback>
                    {user.username[0].toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <p className="font-semibold">{user.username}</p>
                <p className="text-sm text-muted-foreground">{user.fullname}</p>
            </div>
        </Card>
    );
};

export default UserSearchResult;
