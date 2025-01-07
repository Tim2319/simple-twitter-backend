const express = require('express')
const router = express.Router()
const users = require('./modules/users')

// 總體路由
router.use('/users', users)

module.exports = router
