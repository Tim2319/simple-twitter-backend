const db = require('../models')
const { User, JoinRoom, Notification } = db
const { Op } = require('sequelize')
const validator = require('validator')

const PUBLIC_ROOM_ID = Number(process.env.PUBLIC_ROOM_ID)
const interactionTypes = {
  post: 1,
  follow: 2,
  comment: 3,
  like: 4
}
const users = []

const getCurrentUser = async socket => {
  console.log('getCurrentUser function')
  if (!socket.userId) return

  const user = await User.findByPk(socket.userId, {
    raw: true,
    nest: true,
    attributes: ['id', 'name', 'account', 'profilePic', 'cover', 'role']
  })

  if (!user) return

  socket.user = { ...user, socketId: socket.id }
}

const getUserInRoom = async roomId => {
  console.log('getUserInRoom function')
  console.log('roomId', roomId)

  const usersId = new Set()
  users.forEach(user => {
    if (!usersId.has(user.userId) && user.roomId === roomId) {
      usersId.add(user.userId)
    }
  })

  console.log('usersId', usersId)

  const usersInRoom = await User.findAll({
    where: {
      id: [...usersId]
    },
    raw: true,
    nest: true,
    attributes: ['id', 'name', 'account', 'profilePic']
  })
  console.log('usersInRoom', usersInRoom)

  return usersInRoom
}

const addUser = async ({ socketId, roomId, userId, username }) => {
  console.log('addUser function')
  console.log('socketId', socketId)
  console.log('roomId', roomId)
  console.log('userId', userId)
  console.log('username', username)

  const user = { socketId, roomId, userId, username }
  users.push(user)
  console.log('users', users)

  if (Number(roomId) === PUBLIC_ROOM_ID) {
    console.log(`User ${username} joined the public room`)

    await JoinRoom.findOrCreate({
      where: { UserId: userId, ChatRoomId: roomId }
    })
  }
  return user
}

const removeUser = async socket => {
  console.log('removeUser function')
  console.log('socket.id', socket.id)

  const index = users.findIndex(
    user => user.socketId === socket.id && user.roomId === PUBLIC_ROOM_ID)

  console.log('index', index)

  if (index === -1) return null

  const user = users.splice(index, 1)[0]
  console.log('users', users)

  return user
}

async function checkUserInfo (req) {
  const errors = []
  const { account, name, email, password, checkPassword } = req.body

  // Before creating an account or updating account info ,
  // make sure all the required fields are correctly filled out
  if (!account || !name || !email || !password || !checkPassword) {
    errors.push({ message: 'Please fill out all fields.' })
  }
  if (email && !validator.isEmail(email)) {
    errors.push({ message: 'Please enter the correct email address.' })
  }
  if (password && !validator.isByteLength(password, { min: 0, max: 12 })) {
    errors.push({ message: 'Password does not meet the required length' })
  }
  if (password !== checkPassword) {
    errors.push({ message: 'Password and checkPassword do not match.' })
  }
  if (name && !validator.isByteLength(name, { min: 0, max: 50 })) {
    errors.push({ message: 'Name can not be longer than 50 characters.' })
  }
  if (account && !validator.isByteLength(account, { min: 0, max: 50 })) {
    errors.push({
      message: 'Account can not be longer than 50 characters.'
    })
  }

  if (errors.length > 0) return { errors }

  // email and account should be unique
  let users
  // setting page
  if (req.user) {
    users = await User.findAll({
      where: {
        [Op.or]: [{ email }, { account }],
        [Op.not]: [{ id: req.user.id }]
      }
    })
  }

  // register page
  if (!req.user) {
    users = await User.findAll({
      where: { [Op.or]: [{ email }, { account }] }
    })
  }

  console.log('users', users)

  if (users.length) return true
  return false
  // }
}
function getFollowshipInfo (user, followships, currentUserFollowings) {
  const idName = followships === 'Followers' ? 'followerId' : 'followingId'

  return user.dataValues[followships].map(followship => {
    if (!followship.role === 'admin') {
      return null
    }
    return {
      [idName]: followship.id,
      name: followship.name,
      account: followship.account,
      profilePic: followship.profilePic,
      isFollowed: currentUserFollowings.includes(followship.id)
    }
  })
}

function getResourceInfo (user, resource, likes) {
  return user.dataValues[resource].map(el => {
    const post = el.Post
    if (!post) {
      return null
    }
    return {
      id: el.id,
      comment: el.comment,
      createdAt: el.createdAt,
      postId: el.postId,
      post: {
        id: post.id,
        description: post.description,
        createdAt: post.createdAt,
        isLiked: likes.includes(post.id),
        User: {
          id: post.User.id,
          account: post.User.account,
          name: post.User.name,
          profilePic: post.User.profilePic
        },
        commentsCount: post.Comments.length,
        likesCount: post.Likes.length
      }
    }
  })
}

function getUserInfoId (req, info) {
  if (req.user[info]) return req.user[info].map(el => el.id)
  return null
}

module.exports = {
  getCurrentUser,
  getUserInRoom,
  addUser,
  removeUser,
  getFollowshipInfo,
  getResourceInfo,
  checkUserInfo,
  getUserInfoId
}
