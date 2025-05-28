const Community = require("../../models");

const deleteCommunity = async (req, res) => {
  const { id } = req.params;
  try {
    const community = await Community.findByPk(id);
    if (!community) {
      return res.status(404).json({
        message: "Community not found"
      });
    }
    await community.destroy();
    return res.status(200).json({
      message: "Community deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};  

module.exports = deleteCommunity;