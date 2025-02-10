const express = require('express')
const { validateSignUpDetails, validateLoginDetails, validateForgotPassword } = require('../middleware/authMiddleware')
const { signupUser, loginUser, logoutUser, forgotPassword, sendOtp, verifyOtp } = require('../controllers/authController')
const { authenticateUser } = require('../middleware/userValidate')

const router = express.Router()

router.post('/signup', validateSignUpDetails, signupUser)
router.post('/login', validateLoginDetails, loginUser)
router.post('/forgot-password', validateForgotPassword, forgotPassword)
router.post('/send-otp', validateForgotPassword, sendOtp)
router.post('/verify-otp', validateForgotPassword, verifyOtp)
router.post('/logout', authenticateUser, logoutUser)

module.exports = router