const db = require('../models')
const { ChatRoom, JoinRoom, Message, User, Post, Comment, Notification } = db
const { sequelize, Sequelize } = require('../models')
const PUBLIC_ROOM_ID = require('../utils/userValidation')
const { Op } = require('sequelize')

const roomController = {
  getRoom: async (req, res, next) => {
    try {
      const roomId = Number(req.params.roomId) || null
      const userId = req.user.id

      if (!roomId) {
        return res.status(400).json({ status: 'error', message: 'Missing roomId' })
      }

      const chatRoom = await ChatRoom.findOne({ where: { id: roomId } })
      if (!chatRoom) {
        return res.status(404).json({ status: 'error', message: 'Chat room not found' })
      }

      const set = new Set()
      const onlineUsers = []
      onlineUsers.forEach(user => {
        if (user.userId !== userId && !set.has(user.userId)) {
          set.add(user.userId)
          return true
        }
        return false
      })

      const onlineUserData = await User.findAll({
        raw: true,
        nest: true,
        where: { id: [...set] }
      })

      const usersData = await onlineUserData.map(user => ({
        id: user.id,
        name: user.name,
        account: user.account,
        profilePic: user.profilePic
      }))

      // get messages from chat room
      const messages = await Message.findAll({
        raw: true,
        nest: true,
        include: [User],
        where: { ChatRoomId: roomId },
        order: [['createdAt', 'ASC']]
      })

      const messageData = messages.map(message => ({
        id: message.id,
        profilePic: message.User?.profilePic || null,
        UserId: message.UserId,
        message: message.message,
        createdAt: message.createdAt
      }))

      return res.status(200).json({
        onlineUsersCount: onlineUsers.length + 1,
        onlineUsers: usersData,
        messages: messageData
      })
    } catch (error) {
      next(error)
    }
  },
  // create private chat room
  createRoom: async (req, res, next) => {
    try {
      console.log('createRoom')
      console.log('req.body.userId', req.body.userId)
      console.log('req.body', req.body)

      const currentUserId = req.user.id
      const receiverId = req.body.userId

      const existingRoom = await JoinRoom.findOne({
        include: [
          {
            model: ChatRoom,
            as: 'chatRoom',
            where: { isGroup: false },
            attributes: ['id']
          }
        ],
        where: {
          userId: [currentUserId, receiverId]
        },
        attributes: ['id'],
        group: ['chatRoom.id'],
        having: sequelize.literal('COUNT(ChatRoomId) = 2')
      })

      if (existingRoom) {
        console.log('Found existing room:', existingRoom.chatRoom.id)
        await JoinRoom.update(
          { updatedAt: new Date() },
          {
            where: {
              userId: [currentUserId, receiverId],
              ChatRoomId: existingRoom.ChatRoomId.id
            }
          }
        )

        return res.status(200).json({
          status: 'success',
          roomId: existingRoom.ChatRoomId.id
        })
      }
      // create a new room
      const newRoom = await ChatRoom.create({
        name: `Private Chat ${currentUserId}-${receiverId ?? 'Unknown'}`,
        isGroup: false
      })

      await JoinRoom.bulkCreate([
        { userId: currentUserId, ChatRoomId: newRoom.id },
        { userId: receiverId, ChatRoomId: newRoom.id }
      ])

      console.log('Created new room:', newRoom)
      return res.status(200).json({
        status: 'success',
        roomId: newRoom.id
      })
    } catch (error) {
      next(error)
    }
  },
  // join public room
  getRoomsByUser: async (req, res, next) => {
    try {
      const currentUserId = req.user.id
      const joinedRooms = await JoinRoom.findAll({
        raw: true,
        nest: true,
        attributes: ['ChatRoomId'],
        where: {
          userId: req.user.id,
          ChatRoomId: { [Op.ne]: PUBLIC_ROOM_ID }
        }
      })

      const roomIds = joinedRooms.map(room => room.ChatRoomId)
      if (!roomIds.length) {
        return res.status(200).json([])
      }

      // find all rooms messages
      const messages = await Message.findAll({
        attributes: [
          'ChatRoomId',
          'message',
          'createdAt',
          [Sequelize.col('User.id'), 'userId'],
          [Sequelize.col('User.name'), 'name'],
          [Sequelize.col('User.account'), 'account'],
          [Sequelize.col('User.profilePic'), 'profilePic']
        ],
        where: {
          ChatRoomId: { [Op.in]: roomIds }
        },
        include: [
          { model: User, attributes: [] },
          { model: ChatRoom, attributes: [] }
        ],
        order: [['createdAt', 'DESC']],
        raw: true,
        nest: true
      })

      if (!messages.length) {
        const chatAttendees = await JoinRoom.findAll({
          where: {
            ChatRoomId: { [Op.in]: roomIds },
            UserId: { [Op.ne]: currentUserId }
          },
          include: [{ model: User, attributes: ['id', 'name', 'account', 'profilePic'] }],
          raw: true,
          nest: true
        })

        return res.status(200).json(
          chatAttendees.map(user => ({
            userId: user.User.id,
            name: user.User.name,
            account: user.User.account,
            profilePic: user.User.profilePic,
            roomId: user.ChatRoomId,
            message: null,
            createdAt: null
          }))
        )
      }

      return res.status(200).json(
        messages.map(msg => ({
          userId: msg.userId,
          name: msg.name,
          account: msg.account,
          profilePic: msg.profilePic,
          roomId: msg.ChatRoomId,
          message: msg.message,
          createdAt: msg.createdAt
        }))
      )
    } catch (error) {
      next(error)
    }
  },
  // count unread messages
  countUnreadMsg: async (req, res, next) => {
    try {
      const currentUserId = req.user.id

      // Find all chat rooms the user has joined, except the public room
      const joinedRooms = await JoinRoom.findAll({
        attributes: ['ChatRoomId'],
        where: {
          UserId: currentUserId,
          ChatRoomId: { [Op.ne]: PUBLIC_ROOM_ID }
        },
        raw: true
      })

      const ChatRoomIds = joinedRooms.map(room => room.ChatRoomId)

      if (!ChatRoomIds.length) {
        return res.status(200).json(0) // Return 0 if the user has not joined any rooms
      }

      // Count unread messages: messages created after the user's last update in the chat room
      const unreadCount = await Message.count({
        include: [
          {
            model: ChatRoom,
            required: true,
            include: [
              {
                model: JoinRoom,
                as: 'chatRoom',
                required: true,
                where: {
                  UserId: currentUserId,
                  updatedAt: { [Op.lt]: Sequelize.col('Message.createdAt') } // Only count messages created after the user's last update
                }
              }
            ]
          }
        ],
        where: {
          ChatRoomId: { [Op.in]: ChatRoomIds } // Only count messages created after the user's last update
        }
      })

      return res.status(200).json(unreadCount)
    } catch (error) {
      next(error)
    }
  },
  getNotifications: async (req, res, next) => {
    try {
      // Fetch notifications for the logged-in user
      const notifications = await Notification.findAll({
        attributes: ['UserId', 'type', 'receiverId', 'PostId', 'CommentId'],
        where: { receiverId: req.user.id },
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'profilePic']
          },
          {
            model: Post,
            attributes: ['id', 'content']
          },
          {
            model: Comment,
            attributes: ['id', 'content']
          }
        ],
        order: [['updatedAt', 'DESC']],
        raw: true,
        nest: true
      })

      if (!notifications.length) {
        return res.status(200).json([]) // Return an empty array instead of `null`
      }

      // Format notification data
      const formattedNotifications = notifications.map(el => ({
        userId: el.UserId,
        name: el.User?.name || null, // Handle cases where associations may be missing
        profilePic: el.User?.profilePic || null,
        PostId: el.Post?.id || null,
        Post: el.Post?.content || null,
        CommentId: el.Comment?.id || null,
        Comment: el.Comment?.comment || null,
        type: el.type
      }))

      return res.status(200).json(formattedNotifications)
    } catch (error) {
      next(error)
    }
  }
}
module.exports = roomController
