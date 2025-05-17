

const getProfile = async (req, res) => {
    try {
        var user = req.user;

        if (!user) {
            return res.status(401).json({
                message: "User not found",
                status: "error",
            });
        }

        const data = {
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        }

        res.status(200).json({
            message: "Profile fetched successfully",
            status: "success",
            data: data,
        });
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({
            message: error.message || "Internal server error",
            status: "error",
        });
    }
};


module.exports = getProfile;