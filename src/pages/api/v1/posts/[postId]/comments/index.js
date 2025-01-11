// api/v1/posts/[postId]/comments.js
import {
  defaultHandler,
  invalidRequest,
  successWithJson
} from '@/utils/server/api-helpers'

const getComments = async (req, res, session, prisma) => {
  const { postId } = req.query

  try {
    const comments = await prisma.comment.findMany({
      where: {
        postId: parseInt(postId)
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        likes: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return successWithJson(res, comments)
  } catch (error) {
    console.error('Get comments error:', error)
    throw error
  }
}

const createComment = async (req, res, session, prisma) => {
  console.log(req.query)
  const { postId } = req.query
  const { content } = req.body

  console.log('Creating comment:', {
    postId,
    content,
    userId: session?.user?.id
  })

  if (!content?.trim()) {
    return invalidRequest(res, 'Comment content is required')
  }

  try {
    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        author: {
          connect: { id: session.user.id }
        },
        post: {
          connect: { id: parseInt(postId) }
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    })

    return successWithJson(res, comment)
  } catch (error) {
    console.error('Comment creation error:', error)
    throw error // Let defaultHandler handle the error
  }
}

const updateComment = async (req, res, session, prisma) => {
  const { postId, commentId } = req.query
  const { content } = req.body

  if (!content?.trim()) {
    return invalidRequest(res, 'Comment content is required')
  }

  try {
    // Check if comment exists and belongs to user
    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
      select: { authorId: true }
    })

    if (!existingComment) {
      return invalidRequest(res, 'Comment not found')
    }

    if (existingComment.authorId !== session.user.id) {
      return forbidden(res, 'You can only edit your own comments')
    }

    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(commentId) },
      data: { content: content.trim() },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        likes: true
      }
    })

    return successWithJson(res, updatedComment)
  } catch (error) {
    console.error('Update comment error:', error)
    throw error
  }
}

const deleteComment = async (req, res, session, prisma) => {
  const { postId, commentId } = req.query

  try {
    // Check if comment exists and belongs to user
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
      select: { authorId: true }
    })

    if (!comment) {
      return invalidRequest(res, 'Comment not found')
    }

    if (comment.authorId !== session.user.id) {
      return forbidden(res, 'You can only delete your own comments')
    }

    await prisma.comment.delete({
      where: { id: parseInt(commentId) }
    })

    return successWithJson(res, { message: 'Comment deleted successfully' })
  } catch (error) {
    console.error('Delete comment error:', error)
    throw error
  }
}

const handler = async (req, res) =>
  defaultHandler(
    req,
    res,
    {
      GET: getComments,
      POST: createComment
    },
    {
      requiresAuth: true
    }
  )

export default handler
