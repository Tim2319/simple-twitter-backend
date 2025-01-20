const express = require('express')
const router = express.Router()
const postController = require('../../controllers/post-controller')

router.get('/getPosts', postController.getPosts)
router.get('/getPost/:id', postController.getPost)

router.post('/createPost', postController.createPost)
router.put('/updatePost/:id', postController.updatePost)
router.delete('/deletePost/:id', postController.deletePost)

module.exports = router
