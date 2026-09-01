const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { sendEmail } = require('../../services/email');
const models = require('../../models');

const generateToken = payload => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const generateOtp = () => {
  const otp = Math.floor(1000 + Math.random() * 9000);
  return otp.toString();
};

const signUp = async (req, res) => {
  try {
    const { email, password, firstName, lastName, confirmPassword } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !confirmPassword) {
      return res.status(400).json({
        message: 'All fields are required',
        status: 'error',
      });
    }

    // Check environment variables
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: 'Server configuration error',
        status: 'error',
      });
    }

    // Validate email
    if (!validateEmail(email)) {
      return res.status(400).json({
        message: 'Invalid email format',
        status: 'error',
      });
    }

    // Check password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: 'Passwords do not match',
        status: 'error',
      });
    }

    // Check if user already exists
    const existingUser = await models.User.findOne({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists',
        status: 'error',
      });
    }

    const uid = uuidv4();
    const otpCode = generateOtp();

    // Create user first
    const newUser = await models.User.create({
      email: email,
      userId: uid,
      password: await bcrypt.hash(password, 10),
      firstName: firstName,
      lastName: lastName,
      isVerified: false,
    });

    if (!newUser) {
      return res.status(400).json({
        message: 'Failed to create user',
        status: 'error',
      });
    }

    // Create OTP with expiration
    const otpRecord = await models.Otp.create({
      userId: uid,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      isUsed: false,
    });

    // Send email with OTP
    try {
      await sendEmail(
        email,
        'Verify Your Account',
        `Your verification code is: ${otpCode}. This code will expire in 10 minutes.`
      );
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the registration if email fails
    }

    const result = newUser.toSafeJSON();

    result.token = generateToken({
      userId: result.userId,
    });

    return res.status(201).json({
      message:
        'User created successfully. Please check your email for verification code.',
      status: 'success',
      data: result,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      message: error.message || 'Internal server error',
      status: 'error',
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { code } = req.body;

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: 'No token provided',
        status: 'error',
      });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    // Verify token
    let tokenData;
    try {
      tokenData = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        message: 'Invalid token',
        status: 'error',
      });
    }

    if (!tokenData.userId) {
      return res.status(401).json({
        message: 'Invalid token format',
        status: 'error',
      });
    }

    if (!code) {
      return res.status(400).json({
        message: 'OTP code is required',
        status: 'error',
      });
    }

    // Find valid OTP record
    const otpRecord = await models.Otp.scope('notExpired').findOne({
      where: {
        userId: tokenData.userId,
        otp: code,
        isUsed: false,
      },
    });

    if (!otpRecord) {
      return res.status(401).json({
        message: 'Invalid or expired OTP',
        status: 'error',
      });
    }

    // Find and update user
    const foundUser = await models.User.scope('withPassword').findOne({
      where: { userId: tokenData.userId },
    });

    if (!foundUser) {
      return res.status(404).json({
        message: 'User not found',
        status: 'error',
      });
    }

    // Update user verification status
    await foundUser.update({ isVerified: true });

    // Mark OTP as used
    await otpRecord.update({ isUsed: true });

    return res.status(200).json({
      status: 'success',
      message: 'Account verified successfully',
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({
      message: error.message || 'Internal server error',
      status: 'error',
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
        status: 'error',
      });
    }

    // Find user with password
    const foundUser = await models.User.scope('withPassword').findOne({
      where: { email: email },
    });

    if (!foundUser) {
      return res.status(401).json({
        message: 'Invalid email or password',
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
        message: 'Invalid email or password',
        status: 'error',
      });
    }

    // Update last login
    await foundUser.update({ lastLoginAt: new Date() });

    // Generate token
    const token = generateToken({
      userId: foundUser.userId,
    });

    // Return safe user data
    const userData = foundUser.toSafeJSON();

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      token: token,
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      message: error.message || 'Internal server error',
      status: 'error',
    });
  }
};

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
    } catch (error) {
      return res.status(401).json({
        message: 'Invalid token',
        status: 'error',
      });
    }

    if (!tokenData.userId) {
      return res.status(401).json({
        message: 'Invalid token format',
        status: 'error',
      });
    }

    // Find user
    const foundUser = await models.User.findOne({
      where: { userId: tokenData.userId },
    });

    if (!foundUser) {
      return res.status(404).json({
        message: 'User not found',
        status: 'error',
      });
    }

    const userData = foundUser.toSafeJSON();

    return res.status(200).json({
      status: 'success',
      message: 'Token verified successfully',
      data: userData,
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
