import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { AppError, asyncHandler } from "../middleware/errorHandler.js";
import User from "../models/User.js";

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