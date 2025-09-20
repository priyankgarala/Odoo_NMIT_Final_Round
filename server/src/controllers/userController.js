import {  updateUserProfileById } from "../microservices/user.dao.js";

const getProfile = async (req, res) => {
    try {
        // req.user is set by auth middleware as a plain Postgres row
        const userRow = req.user;
        if(!userRow) return res.status(401).json({ message: "Unauthorized" });
        const { password, ...sanitized } = userRow;
        res.status(200).json(sanitized);
    } catch (error) {
        console.error("Get profile error:", error.message);
        res.status(500).json({ message: "Failed to get profile" });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, email, bio, avatar } = req.body;
        const userRow = req.user;
        if(!userRow) return res.status(401).json({ message: "Unauthorized" });

        const updated = await updateUserProfileById({
            id: userRow.id,
            name,
            email,
            bio,
            avatar
        });

        if (!updated) {
            return res.status(404).json({ message: "User not found" });
        }

        const { password, ...sanitized } = updated;
        res.status(200).json(sanitized);
    } catch (error) {
        console.error("Update profile error:", error.message);
        res.status(500).json({ message: "Failed to update profile" });
    }
};

export default {
    getProfile,
    updateProfile
};
