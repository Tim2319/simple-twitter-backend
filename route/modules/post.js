const express = require('express')
const router = express.Router()
const postController = require('../../controllers/post-controller')
const upload = require('../../middleware/multer')

const { authenticatedUser } = require('../../middleware/auth')

// Post constructor
router.get('/getPosts', postController.getPosts)
router.get('/getPost/:id', postController.getPost)
router.post('/createPost', authenticatedUser, upload.array('media', 4), postController.createPost)
router.put('/updatePost/:id', authenticatedUser, upload.array('media', 4), postController.updatePost)
router.delete('/deletePost/:id', authenticatedUser, postController.deletePost)
// like constructor
router.post('/likePost/:id', authenticatedUser, postController.likePost)
// Comment constructor
router.post('/createComment', authenticatedUser, upload.array('media', 4), postController.createComment)
router.get('/createComment/:id', postController.getComments)
router.put('/updateComment/:id', authenticatedUser, upload.array('media', 4), postController.updateComment)
router.delete('/deleteComment/:id', authenticatedUser, postController.deleteComment)

module.exports = router
