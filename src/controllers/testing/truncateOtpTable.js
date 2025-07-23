const models = require('../../models');

const truncateOtpTable = async (req, res) => {
  try {
    const { sequelize } = models;
    await sequelize.query('TRUNCATE TABLE otps CASCADE');
    return res.status(200).json({
      message: ` otps deleted successfully`,
      status: 'success',
    });
  } catch (error) {
    console.error('Delete users error:', error);
    return res.status(500).json({
      message: error.message || 'Internal server error',
      status: 'error',
    });
  }
};

//fetch all otp
const fetchAllOtp = async (req, res) => {
  try {
    const { sequelize } = models;
    const otps = await sequelize.query('SELECT * FROM otps');
    return res.status(200).json({
      message: ` otps fetched successfully`,
      status: 'success',
      data: otps,
    });
  } catch (error) {
    console.error('Fetch users error:', error);
    return res.status(500).json({
      message: error.message || 'Internal server error',
      status: 'error',
    });
  }
};

module.exports = {
  truncateOtpTable,
  fetchAllOtp,
};
