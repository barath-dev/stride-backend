const models = require('../../models');

const verifyToken = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await models.User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    var response = {
      message: 'User found',
      status: 'success',
    };
    return res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = verifyToken;
