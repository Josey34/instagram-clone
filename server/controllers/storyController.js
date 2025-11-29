import Story from "../models/Story.js";
import User from "../models/User.js";

export const createStory = async (req, res) => {
    try {
        const { image: imageUrl } = req.body;
        const loggedUser = req.user.id;

        let imageURL;

        // Check if file was uploaded
        if (req.file) {
            // Upload file to Cloudinary
            const { uploadToCloudinary } = await import('./uploadController.js');
            imageURL = await uploadToCloudinary(req.file.buffer, 'instagram-clone/stories');
        } else if (imageUrl) {
            // Use provided URL
            imageURL = imageUrl;
        } else {
            return res.status(400).json({ message: 'Image is required (file upload or URL)' });
        }

        const story = await Story.create({
            user: loggedUser,
            image: imageURL
        });

        await story.populate('user', 'username profilePicture');

        return res.status(201).json({ message: 'Story created successfully', story });
    } catch (e) {
        return res.status(500).json({ message: 'Failed to create story', error: e.message });
    }
};

export const getFollowingStories = async (req, res) => {
    try {
        const loggedUserId = req.user.id;

        const user = await User.findById(loggedUserId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const stories = await Story.find({
            user: { $in: [...user.following, loggedUserId] },
            expiresAt: { $gt: new Date() }
        })
            .sort({ createdAt: -1 })
            .populate('user', 'username profilePicture');

        return res.status(200).json(stories);
    } catch (e) {
        return res.status(500).json({ message: 'Failed to fetch stories', error: e.message });
    }
};

export const getUserStories = async (req, res) => {
    try {
        const userId = req.params.id;

        const stories = await Story.find({
            user: userId,
            expiresAt: { $gt: new Date() }
        })
            .sort({ createdAt: -1 })
            .populate('user', 'username profilePicture');

        return res.status(200).json(stories);
    } catch (e) {
        return res.status(500).json({ message: 'Failed to fetch user stories', error: e.message });
    }
};

export const viewStory = async (req, res) => {
    try {
        const storyId = req.params.id;
        const loggedUser = req.user.id;

        const story = await Story.findById(storyId);

        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        if (story.expiresAt < new Date()) {
            return res.status(404).json({ message: 'Story has expired' });
        }

        const updatedStory = await Story.findByIdAndUpdate(
            storyId,
            { $addToSet: { viewedBy: loggedUser } },
            { new: true }
        ).populate('user', 'username profilePicture');

        return res.status(200).json(updatedStory);
    } catch (e) {
        return res.status(500).json({ message: 'Failed to view story', error: e.message });
    }
};

export const deleteStory = async (req, res) => {
    try {
        const storyId = req.params.id;
        const loggedUser = req.user.id;

        const story = await Story.findById(storyId);

        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        if (story.user.toString() !== loggedUser) {
            return res.status(403).json({ message: 'Not authorized to delete this story' });
        }

        await Story.findByIdAndDelete(storyId);

        return res.status(200).json({ message: 'Story deleted successfully' });
    } catch (e) {
        return res.status(500).json({ message: 'Failed to delete story', error: e.message });
    }
};