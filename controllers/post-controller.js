const db = require('../models')
const { User, Post, Like, comment } = db

const { getUserInfoId } = require('../utils/userValidation')
const postController = {
  getPosts: async (req, res, next) => {
    try {
      const posts = await Post.findAll({
        include: [User, Like, comment],
        order: [['createdAt', 'DESC']]
      })
      const likes = getUserInfoId(req, 'LikedPosts')

      const formattedPosts = posts.map(posts => {
        const { id, UserId, content, media, createdAt, updatedAt, comments, Likes, PostUser } = posts
        return {
          id,
          UserId,
          content,
          media,
          slicedContent: content.trim().slice(0, 50),
          createdAt,
          updatedAt,
          commentCount: comments.length,
          likeCount: Likes.length,
          isLiked: likes ? likes.includes(id) : null,
          user: {
            id: PostUser.id,
            avatar: PostUser.avatar,
            name: PostUser.name,
            account: PostUser.account
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
        include: [User, Like, comment]
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
      const { content, media } = req.body

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

      const post = await Post.create({
        content,
        media,
        UserId: req.user.id
      })
      return res.status(200).json({
        status: 'success',
        message: 'successfully posted a tweet',
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
      if (post.UserId !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Permission denied'
        })
      }
      // Delete likes and comments associated with the post
      await Promise.all([
        Like.destroy({ where: { postId: post.id } }),
        comment.destroy({ where: { postId: post.id } })
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
      const { content, media } = req.body
      const post = await Post.findByPk(req.params.id)
      if (!post) {
        return res.status(404).json({
          status: 'error',
          message: 'Post not found'
        })
      }
      if (post.UserId !== req.user.id) {
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
      await post.update({
        content: content.trim(),
        media: media || post.media // If media is provided, update it; otherwise, keep the original media file
      })
      return res.json({
        status: 'success',
        message: 'Post updated',
        post
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = postController
