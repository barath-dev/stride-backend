const user = require("../../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const  { v4: uuidv4 } = require('uuid');



const generateToken = (payload) =>{

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}


const signUp = async (req, res) => {
  try {
    const { email, password, firstName, lastName,confirmPassword } = req.body;

    console.log(process.env.JWT_EXPIRES_IN);

    if(process.env.JWT_EXPIRES_IN === undefined){
      return res.status(400).json({
        message: "JWT_EXPIRES_IN is not set",
        status: "error",
      });
    }

    const newUser = await user.create({
      email: email,
      id: uuidv4(),
      password: password,
      firstName: firstName,
      lastName: lastName, 
      confirmPassword: confirmPassword,
    });

    if (!newUser) {
      return res.status(400).json({
        message: "Failed to create user",
        status: "error",
      });
    }

    const result = newUser.toJSON();

    delete result.password;
    delete result.confirmPassword;
    delete result.deletedAt;

    result.token = generateToken({
      id: result.id,
    });

    console.log(result);

    return res.status(201).json({
      message: "User created successfully",
      status: "success",
      data: result,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
      status: "error",
    });
  }
};


const login = async (req,res) =>{
  try {
    console.log("login");

    const { email, password } = req.body;

    if(!email || !password){
      return res.status(400).json({
        message: "Email or password is missing",
        status: "error",
      });
    }

    const result = await user.findOne({
      where:{email:email}
    }); 

    if(!result){
      return res.status(401).json({
        message: "User with email not found",
        status: "error",
      });
    }

    console.log(password===result.password);

    // const isPasswordMatched = await bcrypt.compare(password,result.password);

    // console.log(isPasswordMatched);

    if(password !== result.password){
      return res.status(401).json({
        message: "Incorrect Password",
        status: "error",
      });
    }

    const token  = generateToken({
      id:result.id
    });

    return res.status(201).json({
      status:'success',
      token: token
    })

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message,
      status: "error",
    });
  }
}

module.exports = {
  signUp,
  login
};