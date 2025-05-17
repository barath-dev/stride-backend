const models = require("../../models");

const getActivities = async (req, res) => {
    try {
        const user = req.user;
        const userId = user.userId;

        if (!userId) {
            return res.status(401).json({
                message: "User not found",
                status: "error",
            });
        }

        const activities = await models.Activity.findAll({
            where: {
                userId: userId,
            },
        });

        if (!activities) {
            return res.status(404).json({
                message: "Activities not found",
                status: "error",
            });
        }

        return res.status(200).json({
            message: "Activities fetched successfully",
            status: "success",
            data: activities,
        });
    } catch (error) {
        console.error("Error fetching activities:", error);
        return res.status(500).json({
            message: error.message || "Internal server error",
            status: "error",
        });
    }
};

module.exports = getActivities;