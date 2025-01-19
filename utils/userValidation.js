const db = require('../models')
const { User } = db
const { Op } = require('sequelize')
const validator = require('validator')

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

function getUserInfoId (req, info) {
  if (req.user[info]) return req.user[info].map(el => el.id)
  return null
}

module.exports = {
  checkUserInfo,
  getUserInfoId
}
