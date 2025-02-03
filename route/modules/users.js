const express = require('express')
const router = express.Router()
const userController = require('../../controllers/user-controller')
const followshipController = require('../../controllers/followship-controller')
const upload = require('../../middleware/multer')

const { authenticated, authenticatedUser } = require('../../middleware/auth')

router.get('signin', userController.loginUser)
router.post('signup', userController.registerUser)
router.get('getUsers', authenticated, userController.getUser)
router.get('getUser/:id', authenticated, userController.getTopUsers)
router.put('getUser/:id', authenticatedUser,
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
  userController.editUserUser
)
router.get('Post/:id', authenticated, userController.getPosts)
router.get('likes/:id', authenticated, userController.getLikes)
router.get('commented_post/:id', authenticated, userController.getCommentsAndPosts)
router.get('followers/:id', authenticated, userController.getFollowers)
router.get('followings/:id', authenticated, userController.getFollowings)

router.post('/followships/:id', authenticated, authenticatedUser, followshipController.followUser)
router.delete('/unfollowships/:id', authenticated, authenticatedUser, followshipController.unfollowUser)

module.exports = router
