const { Router } = require('express');
const { login, signUp, verifyOtp } = require('../controllers/auth/auth.controller.js');
const verifyToken = require('../controllers/auth/verify-token.js');


const router = Router();

router.post("/login",login);

router.post("/signUpwithGoogle",);

router.post("/verify",verifyOtp);

router.post("/verify-token",verifyToken);

router.post("/signUp",signUp); 

module.exports = router;