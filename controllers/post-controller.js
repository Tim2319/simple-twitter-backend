const db = require('../models')
const { User, Post, Like, Comment } = db

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
          UserId: req.user.id
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
        UserId: req.user.id
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
      const text = await Comment.create({
        content,
        postId: post.id,
        UserId: req.user.id
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
      await Comment.update({ content })
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
