import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

export const registerUser = async (req, res, next) => {
    try {
        const { username, email, password, fullname } = req.body;
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        // Validate fields
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }
        
        // Check existing users
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        
        if (existingUser) {
            return res.status(400).json({ message: "Username or email already exists" });
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
    } catch (e) {
        console.error(`Error creating user ${e}`)
        res.status(500).json({ message: "Error creating user", error: e.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate fields
        if (!username || !password) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }

        // Check existing users
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: "Invalid Credential" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Credential" });
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
    } catch (e) {
        console.error(`Error logging in user ${req.body}`)
        res.status(500).json({ message: "Error logging in user", error: e.message });
    }
};