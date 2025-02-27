const express = require('express')
const router = express.Router()
const userController = require('../../controllers/user-controller')
const FollowShipController = require('../../controllers/FollowShip-controller')
const upload = require('../../middleware/multer')

const { authenticated, authenticatedUser } = require('../../middleware/auth')

// Auth routes
router.post('/signin', userController.loginUser)
router.post('/signup', userController.registerUser)

// User routes
router.get('/top', authenticated, userController.getTopUsers)
router.get('/current_user', authenticated, userController.getCurrentUser)
router.get('/:id', authenticated, userController.getUser)
router.put('/:id', authenticated, authenticatedUser,
  upload.fields([
    {
      name: 'profilePic',
      maxCount: 1
    },
    {
      name: 'cover',
      maxCount: 1
    }
  ]),
  userController.editUser
)

// Post routes
router.get('/:id/Posts', authenticated, userController.getPosts)
router.get('/:id/likes', authenticated, userController.getLikes)
router.get('/:id/commented_posts', authenticated, userController.getCommentsAndPosts)

// FollowShip routes
router.get('/:id/followers', authenticated, userController.getFollowers)
router.get('/:id/followings', authenticated, userController.getFollowings)
router.post('/:id/follow', authenticated, authenticatedUser, FollowShipController.followUser)
router.delete('/:id/unfollow', authenticated, authenticatedUser, FollowShipController.unfollowUser)

module.exports = router
