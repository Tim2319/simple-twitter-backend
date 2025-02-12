const express = require('express')
const router = express.Router()

const roomController = require('../../controller/room-controller.js')

router.post('/rooms', roomController.createRoom)
router.get('/rooms', roomController.getRoomsByUser)
router.get('/rooms/notifications', roomController.getNotifications)
router.get('/rooms/private/unread', roomController.countUnreadMsg)
router.get('/rooms/:roomId', roomController.getRoom)

module.exports = router
