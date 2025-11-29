import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import { AppError, asyncHandler } from "../middleware/errorHandler.js";
import { extractHashtags } from "../utils/extractHashtag.js";

export const createPost = asyncHandler(async (req, res) => {
    const { caption, image: imageUrl } = req.body;
    const loggedUser = req.user.id;

    let imageURL;

    if (req.file) {
        const { uploadToCloudinary } = await import('./uploadController.js');
        imageURL = await uploadToCloudinary(req.file.buffer, 'instagram-clone/posts');
    } else if (imageUrl) {
        imageURL = imageUrl;
    } else {
        throw new AppError('Image is required (file upload or URL)', 400);
    }

    const hashtag = caption ? extractHashtags(caption) : [];

    const post = await Post.create({
        user: loggedUser,
        image: imageURL,
        caption,
        hashtag
    });

    await post.populate('user', 'username profilePicture');

    return res.status(201).json({ message: "Post created successfully", post });
});

export const getPostById = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id).populate('user', 'username profilePicture').populate('commentsCount');

    if (!post) {
        throw new AppError('Post not found', 404);
    }

    return res.status(200).json(post);
});

export const getUserPosts = asyncHandler(async (req, res) => {
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
});

export const deletePost = asyncHandler(async (req, res) => {
    const postId = req.params.id;
    const loggedUser = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
        throw new AppError('Post not found', 404);
    }

    if (post.user.toString() !== loggedUser) {
        throw new AppError('Not authorized to delete this post', 403);
    }

    await Comment.deleteMany({ post: postId });

    await Post.findByIdAndDelete(postId);

    return res.status(200).json({ message: 'Post deleted successfully' });
});

export const toggleLike = asyncHandler(async (req, res) => {
    const postId = req.params.id;
    const loggedUser = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
        throw new AppError('Post not found', 404);
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
});

export const getFeed = asyncHandler(async (req, res) => {
    const loggedUserId = req.user.id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(loggedUserId);

    if (!user) {
        throw new AppError('User not found', 404);
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
});

export const searchPostsByHashtag = asyncHandler(async (req, res) => {
    const { hashtag } = req.query;

    if (!hashtag) {
        throw new AppError('Hashtag is required', 400);
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
});

export const getExplorePosts = asyncHandler(async (req, res) => {
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
});

export const toggleSavePost = asyncHandler(async (req, res) => {
    const postId = req.params.id;
    const loggedUserId = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
        throw new AppError('Post not found', 404);
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
});

export const getSavedPosts = asyncHandler(async (req, res) => {
    const loggedUserId = req.user.id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const userForCount = await User.findById(loggedUserId);

    if (!userForCount) {
        throw new AppError('User not found', 404);
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
});