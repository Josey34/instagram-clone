import { AppError, asyncHandler } from "../middleware/errorHandler.js";
import Story from "../models/Story.js";
import User from "../models/User.js";

export const createStory = asyncHandler(async (req, res) => {
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
        throw new AppError('Image is required (file upload or URL)', 400);
    }

    const story = await Story.create({
        user: loggedUser,
        image: imageURL
    });

    await story.populate('user', 'username profilePicture');

    return res.status(201).json({ message: 'Story created successfully', story });
});

export const getFollowingStories = asyncHandler(async (req, res) => {
    const loggedUserId = req.user.id;

    const user = await User.findById(loggedUserId);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    const stories = await Story.find({
        user: { $in: [...user.following, loggedUserId] },
        expiresAt: { $gt: new Date() }
    })
        .sort({ createdAt: -1 })
        .populate('user', 'username profilePicture');

    return res.status(200).json(stories);
});

export const getUserStories = asyncHandler(async (req, res) => {
    const userId = req.params.id;

    const stories = await Story.find({
        user: userId,
        expiresAt: { $gt: new Date() }
    })
        .sort({ createdAt: -1 })
        .populate('user', 'username profilePicture');

    return res.status(200).json(stories);
});

export const viewStory = asyncHandler(async (req, res) => {
    const storyId = req.params.id;
    const loggedUser = req.user.id;

    const story = await Story.findById(storyId);

    if (!story) {
        throw new AppError('Story not found', 404);
    }

    if (story.expiresAt < new Date()) {
        throw new AppError('Story has expired', 404);
    }

    const updatedStory = await Story.findByIdAndUpdate(
        storyId,
        { $addToSet: { viewedBy: loggedUser } },
        { new: true }
    ).populate('user', 'username profilePicture');

    return res.status(200).json(updatedStory);
});

export const deleteStory = asyncHandler(async (req, res) => {
    const storyId = req.params.id;
    const loggedUser = req.user.id;

    const story = await Story.findById(storyId);

    if (!story) {
        throw new AppError('Story not found', 404);
    }

    if (story.user.toString() !== loggedUser) {
        throw new AppError('Not authorized to delete this story', 403);
    }

    await Story.findByIdAndDelete(storyId);

    return res.status(200).json({ message: 'Story deleted successfully' });
});