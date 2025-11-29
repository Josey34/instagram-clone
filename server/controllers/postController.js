import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import { extractHashtags } from "../utils/extractHashtag.js";

export const createPost = async (req, res) => {
    try {
        const { image, caption } = req.body;
        const loggedUser = req.user.id;

        const hashtag = caption ? extractHashtags(caption) : [];

        if (!image) {
            return res.status(400).json({ message: 'Image URL is required' });
        }

        const post = await Post.create({
            user: loggedUser,
            image,
            caption,
            hashtag
        });

        await post.populate('user', 'username profilePicture');

        return res.status(201).json({ message: "Post created successfully", post });
    } catch (e) {
        return res.status(500).json({ message: 'Failed to create post', error: e.message });
    }
};

export const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('user', 'username profilePicture').populate('commentsCount');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        return res.status(200).json(post);

    } catch (e) {
        return res.status(500).json({ message: 'Failed to fetch post', error: e.message });
    }
};

export const getUserPosts = async (req, res) => {
    try {
        const userId = req.params.id;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const query = { user: userId };

        const totalPosts = await Post.countDocuments(query);

        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'username profilePicture')
            .populate('commentsCount');

        const totalPages = Math.ceil(totalPosts / limit);
        const hasMore = page < totalPages;

        return res.status(200).json({
            posts,
            pagination: {
                currentPage: page,
                totalPages,
                totalPosts,
                postsPerPage: limit,
                hasMore
            }
        });
    } catch (e) {
        return res.status(500).json({ message: 'Failed to fetch posts', error: e.message });
    }
};

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const loggedUser = req.user.id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.user.toString() !== loggedUser) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await Comment.deleteMany({ post: postId });

        await Post.findByIdAndDelete(postId);

        return res.status(200).json({ message: 'Post deleted successfully' });

    } catch (e) {
        return res.status(500).json({ message: 'Failed to delete post', error: e.message });
    }
};

export const toggleLike = async (req, res) => {
    try {
        const postId = req.params.id;
        const loggedUser = req.user.id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const isLiked = post.likes.some(id => id.toString() === loggedUser);

        let updatedPost;

        if (isLiked) {
            updatedPost = await Post.findByIdAndUpdate(
                postId,
                { $pull: { likes: loggedUser } },
                { new: true }
            ).populate('user', 'username profilePicture');
        } else {
            updatedPost = await Post.findByIdAndUpdate(
                postId,
                { $push: { likes: loggedUser } },
                { new: true }
            ).populate('user', 'username profilePicture');
        }

        return res.status(200).json({
            message: isLiked ? 'Post unliked successfully' : 'Post liked successfully',
            post: updatedPost
        });

    } catch (e) {
        return res.status(500).json({ message: 'Failed to toggle like', error: e.message });
    }
};

export const getFeed = async (req, res) => {
    try {
        const loggedUserId = req.user.id;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const user = await User.findById(loggedUserId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const query = {
            user: { $in: [...user.following, loggedUserId] }
        };

        const totalPosts = await Post.countDocuments(query);

        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'username profilePicture')
            .populate('commentsCount');

        const totalPages = Math.ceil(totalPosts / limit);
        const hasMore = page < totalPages;

        return res.status(200).json({
            posts,
            pagination: {
                currentPage: page,
                totalPages,
                totalPosts,
                postsPerPage: limit,
                hasMore
            }
        });
    } catch (e) {
        return res.status(500).json({ message: 'Failed to fetch feed', error: e.message });
    }
};

export const searchPostsByHashtag = async (req, res) => {
    try {
        const { hashtag } = req.query;

        if (!hashtag) {
            return res.status(400).json({ message: 'Hashtag is required' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const query = { hashtag: { $regex: hashtag, $options: 'i' } };

        const totalPosts = await Post.countDocuments(query);

        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'username profilePicture')
            .populate('commentsCount');

        const totalPages = Math.ceil(totalPosts / limit);
        const hasMore = page < totalPages;

        return res.status(200).json({
            posts,
            pagination: {
                currentPage: page,
                totalPages,
                totalPosts,
                postsPerPage: limit,
                hasMore
            }
        });
    } catch (e) {
        return res.status(500).json({ message: 'Failed to fetch posts', error: e.message });
    }
};

export const getExplorePosts = async (req, res) => {
    try {
        const loggedUserId = new mongoose.Types.ObjectId(req.user.id);

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Count total posts (excluding user's own)
        const totalPosts = await Post.countDocuments({ user: { $ne: loggedUserId } });

        const posts = await Post.aggregate([
            { $match: { user: { $ne: loggedUserId } } },

            { $addFields: { likesCount: { $size: "$likes" } } },

            { $sort: { likesCount: -1, createdAt: -1 } },

            { $skip: skip },
            { $limit: limit },

            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },

            { $unwind: '$user' },

            {
                $project: {
                    'user.password': 0,
                    'user.email': 0,
                    'user.followers': 0,
                    'user.following': 0
                }
            }
        ]);

        const totalPages = Math.ceil(totalPosts / limit);
        const hasMore = page < totalPages;

        return res.status(200).json({
            posts,
            pagination: {
                currentPage: page,
                totalPages,
                totalPosts,
                postsPerPage: limit,
                hasMore
            }
        });
    } catch (e) {
        return res.status(500).json({ message: 'Failed to fetch posts', error: e.message });
    }
};

export const toggleSavePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const loggedUserId = req.user.id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const user = await User.findById(loggedUserId);

        const isSaved = user.savedPosts.some(id => id.toString() === postId);

        if (isSaved) {
            await User.findByIdAndUpdate(
                loggedUserId,
                { $pull: { savedPosts: postId } }
            );
        } else {
            await User.findByIdAndUpdate(
                loggedUserId,
                { $push: { savedPosts: postId } }
            );
        }

        return res.status(200).json({
            message: isSaved ? 'Post unsaved successfully' : 'Post saved successfully',
            isSaved: !isSaved
        });
    } catch (e) {
        return res.status(500).json({ message: 'Failed to save/unsave post', error: e.message });
    }
};

export const getSavedPosts = async (req, res) => {
    try {
        const loggedUserId = req.user.id;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const userForCount = await User.findById(loggedUserId);

        if (!userForCount) {
            return res.status(404).json({ message: 'User not found' });
        }

        const totalPosts = userForCount.savedPosts.length;
        const totalPages = Math.ceil(totalPosts / limit);
        const hasMore = page < totalPages;

        const user = await User.findById(loggedUserId).populate({
            path: 'savedPosts',
            options: {
                sort: { createdAt: -1 },
                skip: skip,
                limit: limit
            },
            populate: [
                { path: 'user', select: 'username profilePicture' },
                { path: 'commentsCount' }
            ]
        });

        return res.status(200).json({
            posts: user.savedPosts,
            pagination: {
                currentPage: page,
                totalPages,
                totalPosts,
                postsPerPage: limit,
                hasMore
            }
        });
    } catch (e) {
        return res.status(500).json({ message: 'Failed to fetch saved posts', error: e.message });
    }
};