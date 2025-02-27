const express = require('express')
const router = express.Router()

const roomController = require('../../controllers/room-controller.js')

router.post('/', roomController.createRoom)
router.get('/', roomController.getRoomsByUser)
router.get('/notifications', roomController.getNotifications)
router.get('/private/unread', roomController.countUnreadMsg)
router.get('/:roomId', roomController.getRoom)

module.exports = router
