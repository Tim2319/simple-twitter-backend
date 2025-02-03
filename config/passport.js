const passport = require('passport')

const db = require('../models')
const { User, Post } = db

// JWT
const passportJWT = require('passport-jwt')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

const jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
jwtOptions.secretOrKey = process.env.JWT_SECRET

const Strategy = new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
  const user = await User.findByPk(jwtPayload.id, {
    include: [
      { model: Post, as: 'CommentPosts' },
      { model: Post, as: 'LikedPosts' },
      { model: User, as: 'Followers' },
      { model: User, as: 'Followings' }
    ]
  })
  if (!user) {
    return done(null, false)
  }
  return done(null, user)
})

passport.use(Strategy)

module.exports = passport
