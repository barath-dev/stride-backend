const { Router } = require('express');
const { login, signUp, verifyOtp } = require('../controllers/auth/auth.controller');


const router = Router();

router.post("/login",login);

router.post("/signUpwithGoogle",);

router.post("/verify",verifyOtp);

router.post("/signUp",signUp); 

module.exports = router;