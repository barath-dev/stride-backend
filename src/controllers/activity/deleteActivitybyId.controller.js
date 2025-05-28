const db = require("../../models");
const deleteActivitybyId = async (req, res) => {
    console.log("deleteActivitybyId");
  const { id } = req.params;
  try {
    const activity = await db.Activity.findByPk(id);
    if (!activity) {
      return res.status(404).json({
        message: "Activity not found",
        status: "error",
      });
    }
    await activity.destroy();
    return res.status(200).json({
      message: "Activity deleted successfully",
      status: "success",
    });
  } catch (error) {
    console.error("Error deleting activity:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      status: "error",
    });
  }
};

module.exports = deleteActivitybyId;

