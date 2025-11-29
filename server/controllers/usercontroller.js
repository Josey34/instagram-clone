import bcrypt from "bcryptjs";
import { AppError, asyncHandler } from "../middleware/errorHandler.js";
import User from "../models/User.js";

export const getLoggedInUser = asyncHandler(async (req, res) => {
    let loggedUser = await User.findById(req.user._id).select("-password")

    req.user = loggedUser;

    if (!req.user) {
        throw new AppError("Unauthorized", 401);
    }

    return res.status(200).json(req.user);
});

export const getUserByUsername = asyncHandler(async (req, res) => {
    const username = req.params.username;

    if (!username) {
        throw new AppError("Please provide a username", 400);
    }

    const fetchedUser = await User.findOne({ username }).select("-password")
    if (!fetchedUser) {
        throw new AppError("User not found", 404);
    }

    return res.status(200).json(fetchedUser);
});

export const updateProfile = asyncHandler(async (req, res) => {
    const { bio, profilePicture: profilePictureUrl, fullname } = req.body;

    const updates = {};
    if (bio !== undefined) updates.bio = bio;
    if (fullname !== undefined) updates.fullName = fullname;

    // Handle profile picture upload
    if (req.file) {
        const { uploadToCloudinary } = await import('./uploadController.js');
        updates.profilePicture = await uploadToCloudinary(req.file.buffer, 'instagram-clone/profile');
    } else if (profilePictureUrl !== undefined) {
        updates.profilePicture = profilePictureUrl;
    }

    // Check if there's anything to update
    if (Object.keys(updates).length === 0) {
        throw new AppError("No fields to update", 400);
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true }
    ).select("-password");

    if (!updatedUser) {
        throw new AppError("User not found", 404);
    }

    return res.status(200).json(updatedUser);
});

export const deleteProfile = asyncHandler(async (req, res) => {
    const { password } = req.body;

    if (!password) {
        throw new AppError("Please provide password to confirm deletion", 400);
    }

    // Verify password
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new AppError("Invalid password", 401);
    }

    await User.updateMany(
        { following: req.user._id },
        { $pull: { following: req.user._id } }
    );

    await User.updateMany(
        { followers: req.user._id },
        { $pull: { followers: req.user._id } }
    );

    await User.findByIdAndDelete(req.user._id);

    return res.status(200).json({ message: "User deleted successfully" });
});

export const toggleFollow = asyncHandler(async (req, res) => {
    const userToFollow = await User.findById(req.params.id);
    const loggedUser = await User.findById(req.user._id);

    if (!userToFollow || !loggedUser) {
        throw new AppError("User not found", 404);
    }

    if (userToFollow._id.toString() === loggedUser._id.toString()) {
        throw new AppError("You cannot follow yourself", 400);
    }

    const isFollowing = loggedUser.following.includes(userToFollow._id);

    if (isFollowing) {
        await User.findByIdAndUpdate(loggedUser._id, { $pull: { following: userToFollow._id } });
        await User.findByIdAndUpdate(userToFollow._id, { $pull: { followers: loggedUser._id } });
    } else {
        await User.findByIdAndUpdate(loggedUser._id, { $push: { following: userToFollow._id } });
        await User.findByIdAndUpdate(userToFollow._id, { $push: { followers: loggedUser._id } });
    }

    return res.status(200).json({ message: isFollowing ? "Unfollowed successfully" : "Followed successfully" });
});

export const getFollowers = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).populate('followers', '-password').select("followers");

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return res.status(200).json(user.followers);
});

export const getFollowing = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).populate('following', '-password').select("following");

    if (!user) {
        throw new AppError("User not found", 404);
    }

    return res.status(200).json(user.following);
});

export const searchUsers = asyncHandler(async (req, res) => {
    const { query } = req.query;

    if (!query) {
        throw new AppError("Please provide a search query", 400);
    }

    const users = await User.find({
        $or: [
            { username: { $regex: query, $options: 'i' } },
            { fullname: { $regex: query, $options: 'i' } },
            { bio: { $regex: query, $options: 'i' } }
        ]
    }).select("-password").limit(20);

    return res.status(200).json(users);
});