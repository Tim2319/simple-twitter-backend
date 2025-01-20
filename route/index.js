const express = require('express')
const router = express.Router()
const users = require('./modules/users')
const posts = require('./modules/posts')

// 總體路由
router.use('/users', users)
route.use('/posts', posts)

module.exports = router
