

export const createUser = async (req, res) => {
    try {
        const { username, email, password, profilePicture, bio } = req.body;
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new User({
            username,
            email,
            hashedPassword,
            profilePicture,
            bio
        });
        
        const savedUser = await user.save();
        
        console.log(`User created ${savedUser}`)
        
        res.status(201).json(savedUser);
    } catch (e) {
        console.error(`Error creating user ${req.body}`)
        res.status(500).json({ message: "Error creating user", error: e.message });
    }
};