import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const getLoggedInUser = async (req, res) => {
    try {
        let loggedUser = await User.findById(req.user._id).select("-password")

        req.user = loggedUser;

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        return res.status(200).json(req.user);
    } catch (e) {
        console.error(`Failed to fetch user ${e.message}`);
        res.status(500).json({ message: "Error fetch user", error: e.message });
    }
};

export const getUserByUsername = async (req, res) => {

    try {
        const username = req.params.username;

        if (!username) {
            return res.status(400).json({ message: "Please provide a username" });
        }

        const fetchedUser = await User.findOne({ username }).select("-password")
        if (!fetchedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(fetchedUser);

    } catch (e) {
        console.error(`Failed to fetch user ${e.message}`);
        res.status(500).json({ message: "Error fetch user", error: e.message });
    }

};

export const updateProfile = async (req, res) => {
    try {
        const { bio, profilePicture: profilePictureUrl } = req.body;

        const updates = {};
        if (bio !== undefined) updates.bio = bio;

        // Handle profile picture upload
        if (req.file) {
            const { uploadToCloudinary } = await import('./uploadController.js');
            updates.profilePicture = await uploadToCloudinary(req.file.buffer, 'instagram-clone/profile');
        } else if (profilePictureUrl !== undefined) {
            updates.profilePicture = profilePictureUrl;
        }

        // Check if there's anything to update
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(updatedUser);

    } catch (e) {
        console.error(`Failed to update user ${e.message}`);
        return res.status(500).json({ message: "Error updating user", error: e.message });
    }
};

export const deleteProfile = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "Please provide password to confirm deletion" });
        }

        // Verify password
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
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

    } catch (e) {
        console.error(`Failed to delete user ${e.message}`);
        return res.status(500).json({ message: "Error deleting user", error: e.message });
    }
};

export const toggleFollow = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const loggedUser = await User.findById(req.user._id);

        if (!userToFollow || !loggedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (userToFollow._id.toString() === loggedUser._id.toString()) {
            return res.status(400).json({ message: "You cannot follow yourself" });
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

    } catch (e) {
        console.error(`Failed to toggle follow ${e.message}`);
        return res.status(500).json({ message: "Error toggling follow", error: e.message });
    }
};

export const getFollowers = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('followers', '-password').select("followers");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user.followers);

    } catch (e) {
        console.error(`Failed to fetch followers ${e.message}`);
        return res.status(500).json({ message: "Error fetching followers", error: e.message });
    }
};

export const getFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('following', '-password').select("following");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user.following);

    } catch (e) {
        console.error(`Failed to fetch following ${e.message}`);
        return res.status(500).json({ message: "Error fetching following", error: e.message });
    }
};

export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: "Please provide a search query" });
        }

        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { profilePicture: { $regex: query, $options: 'i' } },
                { bio: { $regex: query, $options: 'i' } }
            ]
        }).select("-password").limit(20);

        return res.status(200).json(users);

    } catch (e) {
        console.error(`Failed to search users ${e.message}`);
        return res.status(500).json({ message: "Error searching users", error: e.message });
    }
};