import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import User from "../models/User.js";

export const createPost = async (req, res) => {
    try {
        const { image, caption } = req.body;
        const loggedUser = req.user.id;

        if (!image) {
            return res.status(400).json({ message: 'Image URL is required' });
        }

        const post = await Post.create({
            user: loggedUser,
            image,
            caption
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

        const posts = await Post.find({ user: userId }).sort({ createdAt: -1 }).populate('user', 'username profilePicture').populate('commentsCount');

        return res.status(200).json(posts);
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
        
        const user = await User.findById(loggedUserId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const posts = await Post.find({
            user: { $in: [...user.following, loggedUserId] }
        })
        .sort({ createdAt: -1 })
        .populate('user', 'username profilePicture')
        .populate('commentsCount');
        
        return res.status(200).json(posts);
    } catch (e) {
        return res.status(500).json({ message: 'Failed to fetch feed', error: e.message });
    }
};