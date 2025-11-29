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
        const postId = req.params.id;

        const comments = await Comment.find({ post: postId })
            .sort({ createdAt: -1 })
            .populate('user', 'username profilePicture');

        return res.status(200).json({ comments });
    } catch (e) {
        return res.status(500).json({ message: 'Failed to fetch comments', error: e.message });
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