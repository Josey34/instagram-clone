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

}

export const updateProfile = async (req, res) => {
    try {
        const { bio, profilePicture } = req.body;

        const updates = {};
        if (bio !== undefined) updates.bio = bio;
        if (profilePicture !== undefined) updates.profilePicture = profilePicture;

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
}