// Remove unnecessary imports
const models = require('../../models');
const bcrypt = require('bcrypt');

const fetchAllUsers = async (req, res) => {
  try {
    const users = await models.User.findAll({
      attributes: { exclude: ['password'] }, // Exclude password from results
    });

    return res.status(200).json({
      message: 'All users fetched successfully',
      status: 'success',
      data: users,
    });
  } catch (error) {
    console.error('Fetch users error:', error);
    return res.status(500).json({
      message: error.message || 'Internal server error',
      status: 'error',
    });
  }
};

// Delete all users
const deleteAllUsers = async (req, res) => {
  try {
    // More efficient way to delete all users

    const { sequelize } = models;
    await sequelize.query('TRUNCATE TABLE users CASCADE');

    return res.status(200).json({
      message: ` users deleted successfully`,
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

// Fetch single user by ID
const fetchUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await models.User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        status: 'error',
      });
    }

    return res.status(200).json({
      message: 'User fetched successfully',
      status: 'success',
      data: user,
    });
  } catch (error) {
    console.error('Fetch user error:', error);
    return res.status(500).json({
      message: error.message || 'Internal server error',
      status: 'error',
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email } = req.body;

    const user = await models.User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        status: 'error',
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await models.User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          message: 'Email already in use',
          status: 'error',
        });
      }
    }

    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      email: email || user.email,
    });

    const result = user.toJSON();
    delete result.password;

    return res.status(200).json({
      message: 'User updated successfully',
      status: 'success',
      data: result,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({
      message: error.message || 'Internal server error',
      status: 'error',
    });
  }
};

// Delete single user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await models.User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        status: 'error',
      });
    }

    await user.destroy();

    return res.status(200).json({
      message: 'User deleted successfully',
      status: 'success',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      message: error.message || 'Internal server error',
      status: 'error',
    });
  }
};

module.exports = {
  fetchAllUsers,
  deleteAllUsers,
  fetchUserById,
  updateUser,
  deleteUser,
};
