import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

export const createComment = async (req, res) => {
    try {
        const text = req.body.text;
        const postId = req.params.id;
        const loggedUser = req.user.id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (!text) {
            return res.status(400).json({ message: 'Text is required' });
        }

        const comment = await Comment.create({
            text,
            user: loggedUser,
            post: postId
        });

        await comment.populate('user', 'username profilePicture');

        return res.status(201).json({ message: 'Comment created successfully', comment });
    } catch (e) {
        return res.status(500).json({ message: 'Failed to create comment', error: e.message });
    }
};

export const getPostComments = async (req, res) => {
    try {
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
    } catch (e) {
        console.error(`Failed to fetch comments ${e.message}`);
        return res.status(500).json({ message: "Error fetching comments", error: e.message });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const loggedUser = req.user.id;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const post = await Post.findById(comment.post);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (loggedUser !== comment.user.toString() && loggedUser !== post.user.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        await Comment.findByIdAndDelete(commentId);

        return res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (e) {
        return res.status(500).json({ message: 'Failed to delete comments', error: e.message });
    }
};