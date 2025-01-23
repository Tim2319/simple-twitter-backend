const express = require('express')
const router = express.Router()
const userController = require('../../controllers/user-controller')
const followshipController = require('../../controllers/followship-controller')

router.get('signin', userController.loginUser)
router.post('signup', userController.registerUser)
router.get('getUsers', userController.getUser)

router.post('/followships/:id', followshipController.followUser)
router.delete('/unfollowships/:id', followshipController.unfollowUser)

module.exports = router
