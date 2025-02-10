const express = require('express')
const {getUserDetails, updateUserDetails, deleteUserDetails} = require('../controllers/userController')
const { authenticateUser } = require('../middleware/userValidate')

const router = express.Router()

router.get('/', authenticateUser, getUserDetails)
router.put('/', authenticateUser, updateUserDetails)
router.delete('/',authenticateUser, deleteUserDetails)

module.exports = router