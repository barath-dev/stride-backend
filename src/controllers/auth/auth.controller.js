const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { sendEmail } = require('../../services/email');
const models = require('../../models');
const { sequelize } = require('../../models');

const generateToken = payload => {
  return jwt.sign(payload, process.env.JWT_SECRET, {});
};

const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const generateOtp = () => {
  const otp = Math.floor(1000 + Math.random() * 9000);
  return otp.toString();
};

const signUp = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { email, password, firstName, lastName, confirmPassword } = req.body;

    if (!email || !password || !firstName || !lastName || !confirmPassword) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'All fields are required',
        status: 'error',
      });
    }

    if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
      await transaction.rollback();
      return res.status(500).json({
        message: 'Server configuration error',
        status: 'error',
      });
    }

    if (!validateEmail(email)) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'Invalid email format',
        status: 'error',
      });
    }

    if (password !== confirmPassword) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'Passwords do not match',
        status: 'error',
      });
    }

    const existingUser = await models.User.findOne({
      where: { email: email },
      transaction,
    });

    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'User with this email already exists',
        status: 'error',
      });
    }

    const otpCode = generateOtp();

    const newUser = await models.User.create(
      {
        email: email,
        password: await bcrypt.hash(password, 10),
        firstName: firstName,
        lastName: lastName,
      },
      { transaction }
    );

    if (!newUser) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'Failed to create user',
        status: 'error',
      });
    }

    //create a now time
    const otpRecord = await models.Otp.create(
      {
        userId: newUser.id,
        otp: otpCode,
      },
      { transaction }
    );

    try {
      await sendEmail(
        email,
        'Verify Your Account',
        `Your verification code is: ${otpCode}. This code will expire in 10 minutes.`
      );
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      await transaction.rollback();
      return res.status(500).json({
        message: 'Failed to send verification email',
        status: 'error',
      });
    }

    await transaction.commit();

    const result = newUser.toJSON();

    delete result.password;
    delete result.deletedAt;

    result.token = generateToken(
      {
        id: newUser.id,
      },
      process.env.JWT_EXPIRES_IN
    );

    return res.status(201).json({
      message:
        'User created successfully. Please check your email for verification code.',
      status: 'success',
      data: result,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Signup error:', error);
    return res.status(500).json({
      message: error.message || 'Internal server error',
      status: 'error',
    });
  }
};

const verifyOtp = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    console.log('verifyOtp');
    const { code } = req.body;

    const authHeader = req.headers.authorization;

    console.log('Auth header:', authHeader);

    if (!authHeader) {
      console.log('No token provided');
      await transaction.rollback();
      return res.status(401).json({
        message: 'No token provided',
        status: 'error',
      });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    console.log('Token:', token);

    let tokenData;
    try {
      tokenData = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token data:', tokenData);
    } catch (error) {
      await transaction.rollback();
      return res.status(401).json({
        message: 'Invalid token',
        status: 'error',
      });
    }

    if (!tokenData.id) {
      await transaction.rollback();
      return res.status(401).json({
        message: 'Invalid token format',
        status: 'error',
      });
    }

    if (!code) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'OTP code is required',
        status: 'error',
      });
    }

    const otpRecord = await models.Otp.findOne({
      where: {
        userId: tokenData.id,
        otp: code,
      },
      transaction,
    });

    if (!otpRecord) {
      await transaction.rollback();
      return res.status(401).json({
        message: 'Invalid OTP',
        status: 'error',
      });
    }

    if (otpRecord.isExpired()) {
      await otpRecord.destroy({ transaction });
      await transaction.rollback();
      return res.status(401).json({
        message: 'OTP has expired',
        status: 'error',
      });
    }

    const foundUser = await models.User.findOne({
      where: { id: tokenData.id },
      transaction,
    });

    if (!foundUser) {
      await transaction.rollback();
      return res.status(404).json({
        message: 'User not found',
        status: 'error',
      });
    }

    await foundUser.update({ isEmailVerified: true }, { transaction });

    await otpRecord.destroy({ transaction });

    await transaction.commit();

    return res.status(200).json({
      status: 'success',
      message: 'Account verified successfully',
    });
  } catch (error) {
    // Rollback transaction on any error
    await transaction.rollback();
    console.error('OTP verification error:', error);
    return res.status(500).json({
      message: error.message || 'Internal server error',
      status: 'error',
    });
  }
};

const login = async (req, res) => {
  try {
    console.log('login');
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
        status: 'error',
      });
    }

    // Find user (read-only operation, no transaction needed)
    const foundUser = await models.User.findOne({
      where: { email: email },
    });

    if (!foundUser) {
      return res.status(401).json({
        message: 'Invalid email',
        status: 'error',
      });
    }

    // Compare password
    const isPasswordMatched = await bcrypt.compare(
      password,
      foundUser.password
    );

    if (!isPasswordMatched) {
      return res.status(401).json({
        message: 'Invalid password',
        status: 'error',
      });
    }

    // Generate token
    const token = generateToken({
      id: foundUser.id,
      userId: foundUser.userId,
    });

    // Create a copy to avoid modifying the original object
    const userResponse = foundUser.toJSON();

    //remove password from response
    delete userResponse.password;
    delete userResponse.id;

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      token: token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      message: error.message || 'Internal server error',
      status: 'error',
    });
  }
};

//create a function to verify the token

const verifyToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: 'Token is required',
        status: 'error',
      });
    }

    // Verify token
    let tokenData;
    try {
      tokenData = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token data:', tokenData);
    } catch (error) {
      return res.status(401).json({
        message: 'Invalid token',
        status: 'error',
      });
    }

    // Make sure userId exists in the token
    if (!tokenData.userId) {
      return res.status(401).json({
        message: 'Invalid token format',
        status: 'error',
      });
    }

    // Find user (read-only operation, no transaction needed)
    const foundUser = await models.User.findOne({
      where: { userId: tokenData.userId },
    });

    if (!foundUser) {
      return res.status(404).json({
        message: 'User not found',
        status: 'error',
      });
    }

    // Create a copy to avoid modifying the original object
    const userResponse = foundUser.toJSON();

    //remove password from response
    delete userResponse.password;
    delete userResponse.id;

    return res.status(200).json({
      status: 'success',
      message: 'Token verified successfully',
      data: userResponse,
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({
      message: error.message || 'Internal server error',
      status: 'error',
    });
  }
};

module.exports = {
  signUp,
  login,
  verifyOtp,
  verifyToken,
};
