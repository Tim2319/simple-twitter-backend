const db = require('../models')
const { User, Post, Like, Comment } = db
const fs = require('fs')
const path = require('path')

const { getUserInfoId } = require('../utils/userValidation')
const postController = {
  // Post constructor
  getPosts: async (req, res, next) => {
    try {
      const posts = await Post.findAll({
        include: [User, Like, Comment],
        order: [['createdAt', 'DESC']]
      })
      const likes = getUserInfoId(req, 'LikedPosts')

      const formattedPosts = posts.map(posts => {
        const { id, userId, content, media, createdAt, updatedAt, Comments, Likes, User } = posts
        return {
          id,
          userId,
          content,
          media,
          slicedContent: content.trim().slice(0, 50),
          createdAt,
          updatedAt,
          commentCount: Comments.length,
          likeCount: Likes.length,
          isLiked: likes ? likes.includes(id) : null,
          user: {
            id: User.id,
            profilePic: User.profilePic,
            name: User.name,
            account: User.account
          }
        }
      })

      return res.status(200).json({ posts: formattedPosts })
    } catch (error) {
      next(error)
    }
  },
  getPost: async (req, res, next) => {
    try {
      const post = await Post.findByPk(req.params.id, {
        include: [User, Like, Comment]
      })

      if (!post) {
        return res.status(404).json({
          status: 'error',
          message: 'Post not found'
        })
      }
      const likes = getUserInfoId(req, 'LikedPosts')
      const isLiked = likes ? likes.includes(post.id) : null

      const { id, UserId, content, media, createdAt, updatedAt, comments, Likes, PostUser } = post
      return res.status(200).json({
        id,
        UserId,
        content,
        media,
        createdAt,
        updatedAt,
        commentCount: comments.length,
        likeCount: Likes.length,
        isLiked,
        user: {
          id: PostUser.id,
          avatar: PostUser.avatar,
          name: PostUser.name,
          account: PostUser.account
        }
      })
    } catch (error) {
      next(error)
    }
  },
  createPost: async (req, res, next) => {
    try {
      const { content } = req.body
      const { files } = req

      // Check if the content is not empty and has not exceeded the character limit
      if (!content.trim()) {
        return res.status(422).json({
          status: 'error',
          message: 'input should not be blank'
        })
      }
      // Check if the content has exceeded the character limit of 140 characters
      if (content.length > 140) {
        return res.status(422).json({
          status: 'error',
          message: 'input cannot be longer than 140 characters'
        })
      }

      const media = files ? files.map(files => `/uploads/${files.filename}`) : []

      const post = await Post.create({
        userId: req.user.id,
        content,
        media: JSON.stringify(media)
      })
      return res.status(200).json({
        status: 'success',
        message: 'successfully posted a post',
        post
      })
    } catch (error) {
      next(error)
    }
  },
  deletePost: async (req, res, next) => {
    try {
      const post = await Post.findByPk(req.params.id)
      if (!post) {
        return res.status(404).json({
          status: 'error',
          message: 'Post not found'
        })
      }
      if (post.userId !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Permission denied'
        })
      }
      // Delete the media from the database
      if (post.media) {
        const mediaPath = JSON.parse(post.media)
        mediaPath.forEach(mediaPath => {
          const fullPath = path.join(__dirname, '..', 'public', 'uploads', mediaPath)
          fs.unlink(fullPath, err => {
            if (err) {
              console.error('Failed to delete media files:', err)
            }
          })
        })
      }

      // Delete likes and comments associated with the post
      await Promise.all([
        Like.destroy({ where: { postId: post.id } }),
        Comment.destroy({ where: { postId: post.id } })
      ])
      await post.destroy()
      return res.json({
        status: 'success',
        message: 'Post deleted'
      })
    } catch (error) {
      next(error)
    }
  },
  editPost: async (req, res, next) => {
    try {
      const { content } = req.body
      const { files } = req
      const post = await Post.findByPk(req.params.id)
      if (!post) {
        return res.status(404).json({
          status: 'error',
          message: 'Post not found'
        })
      }
      if (post.userId !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Permission denied'
        })
      }
      if (!content.trim()) {
        return res.status(422).json({
          status: 'error',
          message: 'input should not be blank'
        })
      }
      if (content.length > 140) {
        return res.status(422).json({
          status: 'error',
          message: 'input cannot be longer than 140 characters'
        })
      }
      // Delete the old media files if a new files is uploaded
      if (files && post.media) {
        const oldMediaPath = JSON.parse(post.media)
        oldMediaPath.forEach(oldMediaPath => {
          const fullPath = path.join(__dirname, '..', 'public', 'uploads', oldMediaPath)
          fs.unlink(fullPath, err => {
            if (err) {
              console.error('Failed to delete old media files:', err)
            }
          })
        })
      }
      const media = files ? files.map(files => `/uploads/${files.filename}`) : JSON.parse(post.media)

      await post.update({
        content: content.trim(),
        media: JSON.stringify(media)
      })
      return res.json({
        status: 'success',
        message: 'Post updated',
        post
      })
    } catch (error) {
      next(error)
    }
  },
  // Like and Unlike
  likePost: async (req, res, next) => {
    try {
      const post = await Post.findByPk(req.params.id)
      if (!post) {
        return res.status(404).json({
          status: 'error',
          message: 'Post not found'
        })
      }
      const like = await Like.findOne({
        where: {
          postId: post.id,
          userId: req.user.id
        }
      })
      if (like) {
        await like.destroy()
        return res.json({
          status: 'success',
          message: 'Unlike post'
        })
      }
      await Like.create({
        postId: post.id,
        userId: req.user.id
      })
      return res.json({
        status: 'success',
        message: 'Like post'
      })
    } catch (error) {
      next(error)
    }
  },
  // Comment constructor
  addComment: async (req, res, next) => {
    try {
      const { content } = req.body
      const { files } = req
      const post = await Post.findByPk(req.params.id)

      if (!post) {
        return res.status(404).json({
          status: 'error',
          message: 'Post not found'
        })
      }
      const author = await User.findByPk(req.user.id)

      if (!content.trim()) {
        return res.status(422).json({
          status: 'error',
          message: 'input should not be blank'
        })
      }
      const media = files ? files.map(files => `/uploads/${files.filename}`) : []

      const text = await Comment.create({
        content,
        media: JSON.stringify(media),
        postId: post.id,
        userId: req.user.id
      })
      return res.json({
        status: 'success',
        message: `Comment added to ${author.account}'s post`,
        text
      })
    } catch (error) {
      next(error)
    }
  },
  getComments: async (req, res, next) => {
    try {
      const post = await Post.findByPk(req.params.id, {
        include: [Comment]
      })
      if (!post) {
        return res.status(404).json({
          status: 'error',
          message: 'Post not found'
        })
      }
      return res.json({
        status: 'success',
        comments: post.comments
      })
    } catch (error) {
      next(error)
    }
  },
  editComment: async (req, res, next) => {
    try {
      const { content } = req.body
      const { files } = req
      const text = await Comment.findByPk(req.params.commentId)
      if (!text) {
        return res.status(404).json({
          status: 'error',
          message: 'Comment not found'
        })
      }
      if (Comment.UserId !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Permission denied'
        })
      }
      if (!content.trim()) {
        return res.status(422).json({
          status: 'error',
          message: 'input should not be blank'
        })
      }

      // Delete the old media files if a new files is uploaded
      if (files && Comment.media) {
        const oldMediaPath = JSON.parse(Comment.media)
        oldMediaPath.forEach(oldMediaPath => {
          const fullPath = path.join(__dirname, '..', 'public', 'uploads', oldMediaPath)
          fs.unlink(fullPath, err => {
            if (err) {
              console.error('Failed to delete old media files:', err)
            }
          })
        })
      }
      const media = files ? files.map(files => `/uploads/${files.filename}`) : JSON.parse(Comment.media)

      await Comment.update({
        content: content.trim(),
        media: JSON.stringify(media)
      })
      return res.json({
        status: 'success',
        message: 'Comment updated',
        content
      })
    } catch (error) {
      next(error)
    }
  },
  deleteComment: async (req, res, next) => {
    try {
      const text = await Comment.findByPk(req.params.commentId)
      if (!text) {
        return res.status(404).json({
          status: 'error',
          message: 'Comment not found'
        })
      }
      if (text.UserId !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Permission denied'
        })
      }
      // Delete the media from the database
      if (Comment.media) {
        const mediaPath = JSON.parse(Comment.media)
        mediaPath.forEach(mediaPath => {
          const fullPath = path.join(__dirname, '..', 'public', 'uploads', mediaPath)
          fs.unlink(fullPath, err => {
            if (err) {
              console.error('Failed to delete media files:', err)
            }
          })
        })
      }

      await Comment.destroy()
      return res.json({
        status: 'success',
        message: 'Comment deleted'
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = postController
