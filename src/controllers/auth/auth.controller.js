const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require('uuid');
const { sendEmail } = require("../../services/email");
// Import all models from the index file
const models = require("../../models");

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
        message: "All fields are required",
        status: "error",
      });
    }

    // Check environment variables
    if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
      return res.status(500).json({
        message: "Server configuration error",
        status: "error",
      });
    }

    // Validate email
    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format",
        status: "error",
      });
    }

    // Check password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
        status: "error",
      });
    }

    // Check if user already exists
    const existingUser = await models.User.findOne({
      where: { email: email }
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
        status: "error",
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
    });

    if (!newUser) {
      return res.status(400).json({
        message: "Failed to create user",
        status: "error",
      });
    }

    // Create OTP after user is successfully created
    const otpRecord = await models.Otp.create({
      userId: uid,
      otp: otpCode,
    });

    // Send email with OTP
    await sendEmail(
      email, 
      "Verify Your Account", 
      `Your verification code is: ${otpCode}. This code will expire in 10 minutes.`
    );

    const result = newUser.toJSON();

    // Remove sensitive fields
    delete result.password;
    delete result.deletedAt;

    result.token = generateToken({
      // id: result.id,
      userId: result.userId,
    }, process.env.JWT_EXPIRES_IN);

    console.log(result);

    return res.status(201).json({
      message: "User created successfully. Please check your email for verification code.",
      status: "success",
      data: result,
    });

  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      status: "error",
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    console.log("verifyOtp");
    const { code } = req.body;

    // FIXED: Extract auth header correctly from the request headers
    const authHeader = req.headers.authorization;

    console.log("Auth header:", authHeader);

    if (!authHeader) {
      console.log("No token provided");
      return res.status(401).json({
        message: "No token provided",
        status: "error",
      });
    }

    // FIXED: Now authHeader is a string, so this will work properly
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    console.log("Token:", token);

    // FIXED: Added try-catch for token verification
    let tokenData;
    try {
      tokenData = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token data:", tokenData);
    } catch (error) {
      return res.status(401).json({
        message: "Invalid token",
        status: "error",
      });
    }

    // Make sure userId exists in the token
    if (!tokenData.userId) {
      return res.status(401).json({
        message: "Invalid token format",
        status: "error",
      });
    }

    // FIXED: Added validation for OTP code
    if (!code) {
      return res.status(400).json({
        message: "OTP code is required",
        status: "error",
      });
    }

    // Find OTP record
    const otpRecord = await models.Otp.findOne({
      where: {
        userId: tokenData.userId,
        otp: code
      }
    });

    if (!otpRecord) {
      return res.status(401).json({
        message: "Invalid OTP",
        status: "error",
      });
    }

    // FIXED: Added check for OTP expiration
    const now = new Date();
    if (otpRecord.expiresAt && new Date(otpRecord.expiresAt) < now) {
      await otpRecord.destroy(); 
      return res.status(401).json({
        message: "OTP has expired",
        status: "error",
      });
    }

    // Find and update user
    const foundUser = await models.User.findOne({
      where: { userId: tokenData.userId }
    });

    if (!foundUser) {
      return res.status(404).json({
        message: "User not found",
        status: "error",
      });
    }

    // FIXED: Update user verification status properly
    // If you do have isVerified in your model, uncomment this
    await foundUser.update({ isVerified: true });

    // Delete used OTP
    await otpRecord.destroy();

    return res.status(200).json({
      status: "success",
      message: "Account verified successfully",
    });

  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      status: "error",
    });
  }
};

const login = async (req, res) => {
  try {
    console.log("login");
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        status: "error",
      });
    }

    // Find user
    const foundUser = await models.User.findOne({
      where: { email: email }
    });

    if (!foundUser) {
      return res.status(401).json({
        message: "Invalid email",
        status: "error",
      });
    }

    // Compare password
    const isPasswordMatched = await bcrypt.compare(password, foundUser.password);

    if (!isPasswordMatched) {
      return res.status(401).json({
        message: "Invalid email or password",
        status: "error",
      });
    }

    // Generate token
    const token = generateToken({
      id: foundUser.id,
      userId: foundUser.userId
    });

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      token: token,
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: error.message || "Internal server error",
      status: "error",
    });
  }
};

module.exports = {
  signUp,
  login,
  verifyOtp
};