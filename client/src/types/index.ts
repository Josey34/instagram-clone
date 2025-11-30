export interface User {
    _id: string;
    username: string;
    fullname: string;
    email: string;
    profilePicture: string;
    bio: string;
    followers: string[];
    following: string[];
    savedPosts?: string[];
    followersCount: number;
    followingCount: number;
    postsCount: number;
}

export interface UserState {
    profileUser: User | null;
    loading: boolean;
    error: string | null;
}

export interface UserPreview {
    _id: string;
    username: string;
    profilePicture: string;
}

export interface PostState {
    posts: Post[];
    loading: boolean;
    error: string | null;
}

export interface Post {
    _id: string;
    user: UserPreview;
    caption: string;
    image: string;
    likes: string[];
    hashtag: string[];
    likesCount: number;
    commentsCount: number;
    createdAt: string;
}

export interface Comment {
    _id: string;
    user: UserPreview;
    post: string;
    text: string;
    createdAt: string;
}

export interface Story {
    _id: string;
    user: UserPreview;
    image: string;
    expiresAt: string;
    viewedBy: string[];
    viewCount: number;
    createdAt: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterCredentials {
    username: string;
    fullname: string;
    email: string;
    password: string;
}

export interface Notification {
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

export interface NotificationState {
    notifications: Notification[];
}
