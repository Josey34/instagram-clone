import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        minlength: 3,
        maxlength: 30,
        match: /^[a-zA-Z0-9._]+$/
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 50
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    profilePicture: {
        type: String,
        default: "../assets/pictures/blank-profile-picture.png"
    },
    bio: {
        type: String,
        default: ""
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    savedPosts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    }
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});

// Virtual field for followers count
userSchema.virtual('followersCount').get(function () {
    return this.followers?.length || 0;
});

// Virtual field for following count
userSchema.virtual('followingCount').get(function () {
    return this.following?.length || 0;
});

// Virtual field for posts count
userSchema.virtual('postsCount', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'user',
    count: true
});

// Ensure virtuals are included when converting to JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Instance method to create password reset token
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and save to database
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expiration to 1 hour from now
    this.resetPasswordExpires = Date.now() + 60 * 60 * 1000;

    // Return plain token to send via email
    return resetToken;
};

const User = mongoose.model('User', userSchema);

export default User;