const express = require('express')
const router = express.Router()
const admitController = require('../../controllers/admin-controller')

router.get('/users', admitController.getUsers)
router.delete('/posts/:id', admitController.deletePost)

module.exports = router
