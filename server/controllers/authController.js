import bcrypt from "bcryptjs";
import crypto from "crypto";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { AppError, asyncHandler } from "../middleware/errorHandler.js";
import User from "../models/User.js";
import { passwordResetEmail } from "../utils/emailTemplates.js";
import { sendEmail } from "../utils/sendEmail.js";

export const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, fullname } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Validate fields
    if (!username || !email || !password) {
        throw new AppError("Please fill all the fields", 400);
    }

    // Check existing users
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
        throw new AppError("Username or email already exists", 400);
    }

    // Create User
    const user = new User({
        username,
        email,
        password,
        fullname
    });

    const savedUser = await user.save();

    const userWithoutPassword = { ...savedUser, password: "" };

    const token = jwt.sign(
        {userId: user._id},
        process.env.JWT_SECRET,
        {expiresIn: '7d'}
    );

    console.log(`User created ${userWithoutPassword}`)

    res.status(201).json({
        message: "User registered successfully",
        token,
        userWithoutPassword
    });
});

export const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Validate fields
    if (!username || !password) {
        throw new AppError("Please fill all the fields", 400);
    }

    // Check existing users
    const user = await User.findOne({ username });

    if (!user) {
        throw new AppError("Invalid Credential", 401);
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new AppError("Invalid Credential", 401);
    }

    const token = jwt.sign(
        {userId: user._id},
        process.env.JWT_SECRET,
        {expiresIn: '7d'}
    );

    res.status(200).json({
        message: "User logged in successfully",
        token,
        user
    });
});

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Validate email input
    if (!email) {
        throw new AppError("Email is required", 400);
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Don't reveal if email exists for security
    // Always return success message
    if (!user) {
        return res.status(200).json({
            message: "If that email exists, a password reset link has been sent"
        });
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
        // Send email
        await sendEmail({
            to: user.email,
            subject: "Password Reset Request",
            html: passwordResetEmail(resetUrl, user.username)
        });

        res.status(200).json({
            message: "If that email exists, a password reset link has been sent"
        });
    } catch (error) {
        // If email fails, clear reset token
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save({ validateBeforeSave: false });

        throw new AppError("Error sending email. Please try again later.", 500);
    }
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;

    // Validate password input
    if (!password) {
        throw new AppError("Password is required", 400);
    }

    // Hash token to compare with database
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    // Find user with matching token and check expiration
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new AppError("Invalid or expired reset token", 400);
    }

    // Update password (pre-save hook will hash it)
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({
        message: "Password reset successful"
    });
});