const express = require('express')
const router = express.Router()
const userController = require('../../controllers/user-controller')
const followshipController = require('../../controllers/followship-controller')
const upload = require('../../middleware/multer')

router.get('signin', userController.loginUser)
router.post('signup', userController.registerUser)
router.get('getUsers', userController.getUser)
router.put('getUser/:id',
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

router.post('/followships/:id', followshipController.followUser)
router.delete('/unfollowships/:id', followshipController.unfollowUser)

module.exports = router
