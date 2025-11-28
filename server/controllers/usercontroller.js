import User from "../models/User.js";

export const getLoggedInUser = async (req, res) => {
    try {
        User.findById(req.user._id).select("-password").then((user) => {
            req.user = user;
        });
        
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        
        return res.status(200).json(req.user);
    } catch (e) {
        console.error(`Failed to fetch user ${e.message}`);
        req.status(500).json({ message: "Error fetch user", error: e.message });
    }
};