const models = require("../../models");

const saveActivity = async (req, res) => {
    try {
        console.log("saveActivity");
        const  details  = req.body;
        console.log(details);
        const user = req.user;
        const userId = user.userId;
        if (!userId  || !details) {
            return res.status(400).json({
                message: "All fields are required",
                status: "error",
            });
        }

        const activity = await models.Activity.create({
            userId: userId,
            category: "Running",
            details: details,
        });

        if (!activity) {
            return res.status(400).json({
                message: "Failed to create activity",
                status: "error",
            });
        }

        return res.status(201).json({
            message: "Activity created successfully",
            status: "success",
            data: activity,
        });
    } catch (error) {
        console.error("Error creating activity:", error);
        return res.status(500).json({
            message: error.message || "Internal server error",
            status: "error",
        });
    }
};

module.exports = saveActivity;