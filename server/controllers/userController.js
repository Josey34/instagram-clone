import User from "../models/User";

export const registerUser = async (req, res) => {
    try {
        const { username, email, password, profilePicture, bio } = req.body;
        
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
            profilePicture,
            bio
        });
        
        const savedUser = await user.save();
        
        const token = jwt.sign(
            {userId: user._id},
            process.env.JWT_SECRET,
            {expiresIn: '7d'}
        );
        
        console.log(`User created ${savedUser}`)
        
        res.status(201).json({
            message: "User registered successfully",
            token,
            savedUser
        });
    } catch (e) {
        console.error(`Error creating user ${req.body}`)
        res.status(500).json({ message: "Error creating user", error: e.message });
    }
};