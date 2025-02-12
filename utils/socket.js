const socket = require('socket.io')

const { authenticatedSocket } = require('../middleware/auth')
const db = require('../models')
const { Message } = db

const { generateMessage } = require('../utils/message')
const {
  PUBLIC_ROOM_ID,
  interactionTypes,
  getCurrentUser,
  getUserInRoom,
  addUser,
  removeUser,
  getOtherUser,
  updateTime,
  createNotification
} = require('../utils/userValidation')

const socketServer = server => {
  global.io = socket(server, {
    cors: {
      origin: ['*'],
      methods: ['GET', 'POST'],
      transports: ['websocket', 'polling'],
      credentials: true
    },
    allowEIO3: true
  })

  global.io.use(authenticatedSocket).on('connection', async socket => {
    console.log('New client connected')
    console.log('socket.userId', socket.userId)

    await getCurrentUser(socket)

    const userId = socket.user.id
    console.log('socket.user.id', socket.user.id)

    // session
    socket.on('session', async data => {
      console.log('session function')
      console.log('data', data)
      console.log('userId', userId)
      console.log('socket.rooms0', socket.rooms)

      let rooms = []
      if (userId) {
        socket.join([`self ${userId}`, `${PUBLIC_ROOM_ID}`])
        console.log('socket.rooms1', socket.rooms)

        if (data && data.length) {
          rooms = data
          socket.join(rooms)
          console.log('socket.rooms2', socket.rooms)
        } else {
          rooms = [`self ${userId}`, `${PUBLIC_ROOM_ID}`]
        }
      }
      console.log('rooms3 - start session', rooms)
      socket.emit('set session', { rooms })
    })

    // Post
    socket.on('notification', async ({ PostId, Post }) => {
      console.log('notification function')
      console.log('PostId', PostId)

      console.log(`notify users following ${socket.user.account}`)

      socket.broadcast.to(`self ${socket.user.account}`).emit('notification', {
        ...socket.user,
        PostId,
        Post,
        type: interactionTypes.POST
      })
    })

    // like
    socket.on('like', async data => {
      console.log('like function')
      console.log('data', data)

      if (data.userId) {
        data.userId = Number(data.userId)
      }

      await createNotification({
        id: userId,
        currentUserId: data.userId,
        type: interactionTypes.like
      })

      console.log(`broadcast to self ${data.userId}`)

      socket.broadcast
        .to(`self ${data.userId}`)
        .emit('notification', { ...socket.user, type: interactionTypes.like })
    })

    // follow
    socket.on('follow', async data => {
      console.log('follow function')
      console.log('data', data)

      if (data.userId) {
        data.userId = Number(data.userId)
      }

      await createNotification({
        id: userId,
        currentUserId: data.userId,
        type: interactionTypes.follow
      })

      console.log(`broadcast to self ${data.userId}`)

      socket.broadcast
        .to(`self ${data.userId}`)
        .emit('notification', { ...socket.user, type: interactionTypes.follow })
    })

    // comment
    socket.on('comment', async data => {
      console.log('comment function')
      console.log('data', data)

      if (data.userId) {
        data.userId = Number(data.userId)
      }

      await createNotification({
        id: userId,
        currentUserId: data.userId,
        comment: data.commentId,
        type: interactionTypes.comment
      })

      console.log(`broadcast to self ${data.userId}`)

      socket.broadcast
        .to(`self ${data.userId}`)
        .emit('notification', {
          ...socket.user,
          commentId: data.commentId,
          type: interactionTypes.comment
        })
    })

    // join
    socket.on('join', async ({ username, roomId }) => {
      console.log('joinRoom function')
      console.log('username', username)
      console.log('roomId', roomId)
      console.log('PUBLIC_ROOM_ID', PUBLIC_ROOM_ID)

      roomId = Number(roomId)
      socket.join(`${roomId}`)
      console.log('socket.rooms', socket.rooms)

      await updateTime(userId, roomId)

      if (roomId === PUBLIC_ROOM_ID) {
        await addUser({
          socketId: socket.id,
          userId,
          roomId,
          username
        })

        // count users
        const usersInRoom = await getUserInRoom(roomId)

        console.log('usersInRoom', usersInRoom)

        global.io.to(`${roomId}`).emit('users count', {
          users: usersInRoom,
          userCount: usersInRoom.length
        })

        // notify everyone except the user
        socket.broadcast
          .to(`${roomId}`)
          .emit('message',
            generateMessage(`${username} has joined!`))
      }
    })

    socket.on('chat message', async (msg, callback) => {
      console.log('chat message function')
      console.log('msg', msg)

      await Message.create({
        userId,
        chatroomId: PUBLIC_ROOM_ID,
        message: msg.message
      })
      global.io.to(`${PUBLIC_ROOM_ID}`).emit(
        'chat message',
        generateMessage(msg.message, userId, socket.user.profilePic))

      // Event Acknowledgement
      callback()
    })

    // private chat
    socket.on('private chat', async (msg, callback) => {
      console.log('private chat function')
      console.log('msg', msg)
      msg.roomId = Number(msg.roomId)

      await Message.create({
        userId,
        chatroomId: msg.roomId,
        message: msg.message
      })

      global.io.to(`${msg.roomId}`).emit(
        'private chat message',
        generateMessage(msg.message, userId, socket.user.profilePic))

      const otherUser = await getOtherUser(msg.roomId, userId)
      console.log('otherUser', otherUser)

      socket.broadcast.to(`self ${otherUser}`)
        .emit('private chat message', {
          roomId: msg.roomId,
          message: msg.message,
          userId
        })

      // notify another user

      if (msg.newMessage) {
        console.log(`broadcast new msg to self ${otherUser}`)

        socket.broadcast
          .to(`self ${otherUser}`)
          .emit('private chat message',
            generateMessage(msg.message, msg.userId, socket.user.profilePic, true),
            msg.roomId
          )
      }

      // Event Acknowledgement
      callback()
    })

    // user switch to other private room
    socket.on('leave', async (userId, roomId) => {
      console.log('leave function')
      console.log('userId', userId)
      console.log('roomId', roomId)

      if (roomId) {
        socket.leave(`${roomId}`)
        await updateTime(userId, roomId)
        if (roomId === PUBLIC_ROOM_ID) {
          await removeUser(socket)
        }
      }
    })

    socket.on('disconnect', async () => {
      console.log('User disconnected')

      // remove user from public room

      const user = await removeUser(socket)
      console.log('user', user)

      if (user) {
        // count users
        const usersInRoom = await getUserInRoom(user.roomId)
        global.io.to(`${user.roomId}`).emit('users count', {
          users: usersInRoom,
          userCount: usersInRoom.length
        })

        global.io.to(`${user.roomId}`).emit(
          'message',
          generateMessage(`${user.username} has left!`)
        )
      }
    })
  })
}

module.exports = { socketServer }
