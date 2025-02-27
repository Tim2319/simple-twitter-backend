const express = require('express')
const router = express.Router()
const postController = require('../../controllers/post-controller')
const upload = require('../../middleware/multer')

const { authenticatedUser } = require('../../middleware/auth')

// Post constructor
router.get('/', postController.getPosts)
router.get('/:id', postController.getPost)
router.post('/', authenticatedUser, upload.array('media', 4), postController.createPost)
router.put('/:id', authenticatedUser, upload.array('media', 4), postController.editPost)
router.delete('/:id', authenticatedUser, postController.deletePost)
// like constructor
router.post('/:id/like', authenticatedUser, postController.likePost)
// Comment constructor
router.post('/:id/comments', authenticatedUser, upload.array('media', 4), postController.addComment)
router.get('/:id/comments', postController.getComments)
router.put('/:id/comments/:comment_id', authenticatedUser, upload.array('media', 4), postController.editComment)
router.delete('/:id/comments/:comment_id', authenticatedUser, postController.deleteComment)

module.exports = router
