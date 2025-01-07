const express = require('express')
const router = express.Router()
const userController = require('../../controllers/user-controller')

router.get('signin', userController.loginUser)
router.post('signup', userController.registerUser)

module.exports = router
