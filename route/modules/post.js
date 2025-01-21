const express = require('express')
const router = express.Router()
const postController = require('../../controllers/post-controller')

// Post constructor
router.get('/getPosts', postController.getPosts)
router.get('/getPost/:id', postController.getPost)
router.post('/createPost', postController.createPost)
router.put('/updatePost/:id', postController.updatePost)
router.delete('/deletePost/:id', postController.deletePost)
// like constructor
router.post('/likePost/:id', postController.likePost)
// Comment constructor
router.post('/createComment', postController.createComment)
router.get('/createComment/:id', postController.getComments)
router.put('/updateComment/:id', postController.updateComment)
router.delete('/deleteComment/:id', postController.deleteComment)

module.exports = router
