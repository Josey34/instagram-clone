import { AppError, asyncHandler } from "../middleware/errorHandler.js";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

export const createComment = asyncHandler(async (req, res) => {
    const text = req.body.text;
    const postId = req.params.id;
    const loggedUser = req.user.id;

    const post = await Post.findById(postId);

    if (!post) {
        throw new AppError('Post not found', 404);
    }

    if (!text) {
        throw new AppError('Text is required', 400);
    }

    const comment = await Comment.create({
        text,
        user: loggedUser,
        post: postId
    });

    await comment.populate('user', 'username profilePicture');

    return res.status(201).json({ message: 'Comment created successfully', comment });
});

export const getPostComments = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ post: req.params.id })
        .populate('user', 'username profilePicture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Comment.countDocuments({ post: req.params.id });

    return res.status(200).json({
        comments,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

export const deleteComment = asyncHandler(async (req, res) => {
    const commentId = req.params.id;
    const loggedUser = req.user.id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new AppError('Comment not found', 404);
    }

    const post = await Post.findById(comment.post);

    if (!post) {
        throw new AppError('Post not found', 404);
    }

    if (loggedUser !== comment.user.toString() && loggedUser !== post.user.toString()) {
        throw new AppError('Not authorized to delete this comment', 403);
    }

    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json({ message: 'Comment deleted successfully' });
});